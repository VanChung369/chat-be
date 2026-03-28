import { Buffer } from 'node:buffer';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { buildSrc } from '@imagekit/javascript';
import {
  IImageStorageService,
  UploadImageParams,
  UploadImageResult,
} from './image-storage';

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

const IMAGEKIT_UPLOAD_URL = 'https://upload.imagekit.io/api/v1/files/upload';

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

@Injectable()
export class ImageStorageService implements IImageStorageService {
  private readonly logger = new Logger(ImageStorageService.name);

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
          Authorization: `Basic ${Buffer.from(`${privateKey}:`).toString('base64')}`,
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
}
