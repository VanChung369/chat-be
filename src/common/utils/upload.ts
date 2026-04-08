import type { UploadedFile } from '../types';

export type RequestUploadedFile = {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
};

export function mapUploadedFile(file: RequestUploadedFile): UploadedFile {
  return {
    buffer: file.buffer,
    originalname: file.originalname,
    mimetype: file.mimetype,
  };
}
