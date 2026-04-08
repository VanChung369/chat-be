import { Buffer } from 'node:buffer';
import { randomUUID } from 'node:crypto';
import { posix } from 'node:path';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import type { Cache } from 'cache-manager';
import { buildSrc } from '@imagekit/javascript';
import {
  IMAGEKIT_API_BASE_URL,
  IMAGEKIT_UPLOAD_URL,
  TEMP_UPLOAD_CACHE_KEY_PREFIX,
  TEMP_UPLOAD_CACHE_TTL_SECONDS,
  TEMP_UPLOAD_FOLDER,
} from '../../common/constants';
import type {
  ConfirmTempUploadParams,
  UploadImageParams,
  UploadImageResult,
  UploadTempImageResult,
} from '../../common/types';
import type { IImageStorageService } from '../interfaces/image-storage.service.interface';

type ImageKitUploadResponse = {
  fileId: string;
  name: string;
  url?: string;
  thumbnailUrl?: string;
  filePath?: string;
  size?: number;
  width?: number;
  height?: number;
};

type CachedUploadPayload = {
  fileId: string;
  filePath: string;
};

type ImageKitFile = {
  fileId: string;
  name: string;
  filePath?: string;
};

const SAFE_FILE_NAME_REGEX = /^[A-Za-z0-9][A-Za-z0-9._ -]{0,254}$/;

function isImageKitUploadResponse(
  value: unknown,
): value is ImageKitUploadResponse {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const data = value as Record<string, unknown>;
  return typeof data.fileId === 'string' && typeof data.name === 'string';
}

function getErrorMessage(value: unknown): string | null {
  if (typeof value !== 'object' || value === null) {
    return null;
  }

  const data = value as Record<string, unknown>;
  return typeof data.message === 'string' ? data.message : null;
}

function isCachedUploadPayload(value: unknown): value is CachedUploadPayload {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const data = value as Record<string, unknown>;
  return typeof data.fileId === 'string' && typeof data.filePath === 'string';
}

function isImageKitFile(value: unknown): value is ImageKitFile {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const data = value as Record<string, unknown>;
  return typeof data.fileId === 'string' && typeof data.name === 'string';
}

@Injectable()
export class ImageStorageService implements IImageStorageService {
  private readonly logger = new Logger(ImageStorageService.name);

  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

  async upload(params: UploadImageParams): Promise<UploadImageResult> {
    if (!params.file) {
      throw new BadRequestException('File is required');
    }

    const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
    const urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT;
    const uploadFolder = params.folder ?? process.env.IMAGEKIT_UPLOAD_FOLDER;

    if (!privateKey || !urlEndpoint) {
      throw new BadRequestException(
        'Missing ImageKit config: IMAGEKIT_PRIVATE_KEY or IMAGEKIT_URL_ENDPOINT',
      );
    }

    const formData = new FormData();
    const fileBlob = new Blob([new Uint8Array(params.file.buffer)], {
      type: params.file.mimetype,
    });
    formData.set('file', fileBlob, params.file.originalname);
    formData.set('fileName', params.fileName);
    formData.set('useUniqueFileName', 'false');
    formData.set('overwriteFile', 'true');

    if (uploadFolder) {
      formData.set('folder', uploadFolder);
    }

    let response: Response;
    try {
      response = await fetch(IMAGEKIT_UPLOAD_URL, {
        method: 'POST',
        headers: {
          Authorization: this.getImageKitAuthHeader(),
        },
        body: formData,
      });
    } catch (error) {
      this.logger.error(
        `Failed to upload image to ImageKit: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw new BadRequestException(
        'Image upload failed due to a network error',
      );
    }

    const payloadUnknown: unknown = await response.json();
    if (!response.ok) {
      const remoteMessage = getErrorMessage(payloadUnknown);
      const errorMessage = remoteMessage ?? 'Image upload failed';
      this.logger.error(`ImageKit upload failed: ${errorMessage}`);
      throw new BadRequestException(errorMessage);
    }

    if (!isImageKitUploadResponse(payloadUnknown)) {
      throw new BadRequestException('Unexpected ImageKit response');
    }

    const publicUrl =
      payloadUnknown.url ||
      (payloadUnknown.filePath
        ? buildSrc({ urlEndpoint, src: payloadUnknown.filePath })
        : '');

    if (!publicUrl) {
      throw new BadRequestException('ImageKit did not return a public URL');
    }

    return {
      fileId: payloadUnknown.fileId,
      name: payloadUnknown.name,
      url: publicUrl,
      thumbnailUrl: payloadUnknown.thumbnailUrl,
      filePath: payloadUnknown.filePath,
      size: payloadUnknown.size,
      width: payloadUnknown.width,
      height: payloadUnknown.height,
    };
  }

  async uploadToTemp(
    params: UploadImageParams,
  ): Promise<UploadTempImageResult> {
    const sourceName = params.fileName || params.file.originalname;
    const tempId = this.generateTempId(sourceName);

    const result = await this.upload({
      file: params.file,
      fileName: tempId,
      folder: TEMP_UPLOAD_FOLDER,
    });

    if (!result.filePath) {
      throw new BadRequestException(
        'ImageKit did not return file path for temporary upload',
      );
    }

    const cacheValue: CachedUploadPayload = {
      fileId: result.fileId,
      filePath: result.filePath,
    };

    await this.cacheManager.set(
      this.getUploadCacheKey(tempId),
      JSON.stringify(cacheValue),
      TEMP_UPLOAD_CACHE_TTL_SECONDS,
    );

    return {
      ...result,
      tempId,
    };
  }

  async confirmTempUpload(
    params: ConfirmTempUploadParams,
  ): Promise<UploadImageResult> {
    const cacheKey = this.getUploadCacheKey(params.tempId);
    const cachedUpload = await this.cacheManager.get<string>(cacheKey);

    if (!cachedUpload) {
      throw new BadRequestException('Temporary upload not found or expired');
    }

    let cachedPayload: unknown;
    try {
      cachedPayload = JSON.parse(cachedUpload);
    } catch {
      throw new BadRequestException('Invalid temporary upload data');
    }

    if (!isCachedUploadPayload(cachedPayload)) {
      throw new BadRequestException('Invalid temporary upload payload');
    }

    const destinationFolder = this.normalizeDestinationFolder(params.folder);
    const fallbackFileName =
      posix.basename(cachedPayload.filePath) || params.tempId;
    const destinationFileName = params.fileName
      ? this.normalizeFileName(params.fileName)
      : fallbackFileName;
    const destinationPath = `${destinationFolder}/${destinationFileName}`;

    await this.moveFile(cachedPayload.filePath, destinationPath);
    await this.cacheManager.del(cacheKey);

    return {
      fileId: cachedPayload.fileId,
      name: destinationFileName,
      url: this.buildPublicUrl(destinationPath),
      filePath: destinationPath,
    };
  }

  async cleanupOrphanTempUploads(): Promise<void> {
    let files: ImageKitFile[];

    try {
      files = await this.listFilesByPath(TEMP_UPLOAD_FOLDER);
    } catch (error) {
      this.logger.error(
        `Failed to list temporary files: ${error instanceof Error ? error.message : String(error)}`,
      );
      return;
    }

    for (const file of files) {
      try {
        const exists = await this.cacheManager.get<string>(
          this.getUploadCacheKey(file.name),
        );

        if (!exists) {
          await this.deleteFile(file.fileId);
        }
      } catch (error) {
        this.logger.error(
          `Failed to cleanup temporary file ${file.name}: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }
  }

  private generateTempId(sourceName: string): string {
    const ext = posix.extname(sourceName).slice(0, 20);
    return `${randomUUID()}${ext}`;
  }

  private getUploadCacheKey(tempId: string): string {
    return `${TEMP_UPLOAD_CACHE_KEY_PREFIX}${tempId}`;
  }

  private normalizeDestinationFolder(folder: string): string {
    const normalizedFolder = folder.trim().replace(/\/+$/, '');

    if (!normalizedFolder) {
      throw new BadRequestException('Destination folder is required');
    }

    if (!normalizedFolder.startsWith('/')) {
      throw new BadRequestException('Destination folder must start with "/"');
    }

    if (
      normalizedFolder === TEMP_UPLOAD_FOLDER ||
      normalizedFolder.startsWith(`${TEMP_UPLOAD_FOLDER}/`)
    ) {
      throw new BadRequestException('Destination folder cannot be /temp');
    }

    return normalizedFolder;
  }

  private normalizeFileName(fileName: string): string {
    const normalizedFileName = fileName.trim();

    if (!normalizedFileName) {
      throw new BadRequestException('fileName cannot be empty');
    }

    if (
      normalizedFileName === '.' ||
      normalizedFileName === '..' ||
      !SAFE_FILE_NAME_REGEX.test(normalizedFileName)
    ) {
      throw new BadRequestException('Invalid fileName');
    }

    return normalizedFileName;
  }

  private buildPublicUrl(filePath: string): string {
    const urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT;

    if (!urlEndpoint) {
      throw new BadRequestException(
        'Missing ImageKit config: IMAGEKIT_URL_ENDPOINT',
      );
    }

    return buildSrc({
      urlEndpoint,
      src: filePath,
    });
  }

  private getImageKitAuthHeader(): string {
    const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;

    if (!privateKey) {
      throw new BadRequestException(
        'Missing ImageKit config: IMAGEKIT_PRIVATE_KEY',
      );
    }

    return `Basic ${Buffer.from(`${privateKey}:`).toString('base64')}`;
  }

  private async moveFile(
    sourceFilePath: string,
    destinationPath: string,
  ): Promise<void> {
    await this.callImageKitApi('/files/move', {
      method: 'POST',
      body: JSON.stringify({
        sourceFilePath,
        destinationPath,
      }),
    });
  }

  private async deleteFile(fileId: string): Promise<void> {
    await this.callImageKitApi(`/files/${encodeURIComponent(fileId)}`, {
      method: 'DELETE',
    });
  }

  private async listFilesByPath(path: string): Promise<ImageKitFile[]> {
    const query = new URLSearchParams({
      path,
    });

    const payloadUnknown = await this.callImageKitApi<unknown>(
      `/files?${query.toString()}`,
      {
        method: 'GET',
      },
    );

    if (!Array.isArray(payloadUnknown)) {
      return [];
    }

    return payloadUnknown.filter(isImageKitFile);
  }

  private async callImageKitApi<T = unknown>(
    path: string,
    init: RequestInit,
  ): Promise<T> {
    const headers: Record<string, string> = {
      Authorization: this.getImageKitAuthHeader(),
    };

    if (init.body) {
      headers['Content-Type'] = 'application/json';
    }

    let response: Response;
    try {
      response = await fetch(`${IMAGEKIT_API_BASE_URL}${path}`, {
        ...init,
        headers,
      });
    } catch (error) {
      throw new BadRequestException(
        `ImageKit request failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }

    if (!response.ok) {
      const errorMessage = await this.parseImageKitError(response);
      this.logger.error(`ImageKit API failed: ${errorMessage}`);
      throw new BadRequestException(errorMessage);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return undefined as T;
    }

    return (await response.json()) as T;
  }

  private async parseImageKitError(response: Response): Promise<string> {
    const contentType = response.headers.get('content-type') || '';

    if (!contentType.includes('application/json')) {
      const text = await response.text();
      return text || 'ImageKit request failed';
    }

    const payloadUnknown: unknown = await response.json();
    return getErrorMessage(payloadUnknown) ?? 'ImageKit request failed';
  }
}
