export type ImageKitUploadResponse = {
  fileId: string;
  name: string;
  url?: string;
  thumbnailUrl?: string;
  filePath?: string;
  size?: number;
  width?: number;
  height?: number;
};

export type CachedUploadPayload = {
  fileId: string;
  filePath: string;
};

export type ImageKitFile = {
  fileId: string;
  name: string;
  filePath?: string;
};
