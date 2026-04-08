export type UploadedFile = {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
};

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

export type UploadTempImageResult = UploadImageResult & {
  tempId: string;
};

export type ConfirmTempUploadParams = {
  tempId: string;
  folder: string;
  fileName?: string;
};
