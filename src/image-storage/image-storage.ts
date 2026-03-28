import { UploadedFile } from '../common/utils/types';

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
