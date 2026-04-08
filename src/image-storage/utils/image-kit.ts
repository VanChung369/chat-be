import type {
  CachedUploadPayload,
  ImageKitFile,
  ImageKitUploadResponse,
} from '../types/image-kit';

export function isImageKitUploadResponse(
  value: unknown,
): value is ImageKitUploadResponse {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const data = value as Record<string, unknown>;
  return typeof data.fileId === 'string' && typeof data.name === 'string';
}

export function getErrorMessage(value: unknown): string | null {
  if (typeof value !== 'object' || value === null) {
    return null;
  }

  const data = value as Record<string, unknown>;
  return typeof data.message === 'string' ? data.message : null;
}

export function isCachedUploadPayload(
  value: unknown,
): value is CachedUploadPayload {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const data = value as Record<string, unknown>;
  return typeof data.fileId === 'string' && typeof data.filePath === 'string';
}

export function isImageKitFile(value: unknown): value is ImageKitFile {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const data = value as Record<string, unknown>;
  return typeof data.fileId === 'string' && typeof data.name === 'string';
}
