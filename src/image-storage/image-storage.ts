import { UploadedFile } from '../common/utils/types';

export const IMAGE_STORAGE_SERVICE_TOKEN = Symbol('IMAGE_STORAGE_SERVICE_TOKEN');

export type UploadImageParams = {
  file: UploadedFile;
  fileName: string;
  folder?: string;
};

export type UploadImageResult = {
  fileId: string;
  name: string;
  url: string;
  thumbnailUrl?: string;
  filePath?: string;
  size?: number;
  width?: number;
  height?: number;
};

export interface IImageStorageService {
  upload(params: UploadImageParams): Promise<UploadImageResult>;
}
