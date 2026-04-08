import {
  ConfirmTempUploadParams,
  UploadImageParams,
  UploadImageResult,
  UploadTempImageResult,
} from '../../common/types';

export const IMAGE_STORAGE_SERVICE_TOKEN = Symbol(
  'IMAGE_STORAGE_SERVICE_TOKEN',
);

export interface IImageStorageService {
  upload(params: UploadImageParams): Promise<UploadImageResult>;
  uploadToTemp(params: UploadImageParams): Promise<UploadTempImageResult>;
  confirmTempUpload(
    params: ConfirmTempUploadParams,
  ): Promise<UploadImageResult>;
  delete(fileId: string): Promise<void>;
}
