import { BadRequestException } from '@nestjs/common';
import { buildSrc } from '@imagekit/javascript';
import { TEMP_UPLOAD_FOLDER } from '../../common/constants';

export function normalizeDestinationFolder(folder: string): string {
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

export function normalizeFileName(fileName: string): string {
  const normalizedFileName = fileName.trim();

  if (!normalizedFileName || normalizedFileName.length > 255) {
    throw new BadRequestException('fileName is invalid or too long');
  }

  // Allow only safe characters: letters, digits, hyphens, underscores, dots
  if (!/^[a-zA-Z0-9._-]+$/.test(normalizedFileName)) {
    throw new BadRequestException('fileName contains invalid characters');
  }

  if (
    normalizedFileName.includes('/') ||
    normalizedFileName.includes('\\') ||
    normalizedFileName.includes('..') ||
    normalizedFileName.startsWith('.')
  ) {
    throw new BadRequestException('Invalid fileName');
  }

  return normalizedFileName;
}

export function buildPublicUrl(filePath: string): string {
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
