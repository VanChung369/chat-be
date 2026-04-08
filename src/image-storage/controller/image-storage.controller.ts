import {
  BadRequestException,
  Body,
  Controller,
  Inject,
  Post,
  UploadedFile,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { IMAGE_STORAGE_SERVICE_TOKEN } from '../interfaces/image-storage.service.interface';
import type { IImageStorageService } from '../interfaces/image-storage.service.interface';
import { ConfirmTempUploadDto } from '../dto/confirm-temp-upload.dto';
import { UploadImageDto } from '../dto/upload-image.dto';

@Controller('image-storage')
export class ImageStorageController {
  constructor(
    @Inject(IMAGE_STORAGE_SERVICE_TOKEN)
    private readonly imageStorageService: IImageStorageService,
  ) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @UploadedFile()
    file: {
      buffer: Buffer;
      originalname: string;
      mimetype: string;
    },
    @Body(new ValidationPipe()) uploadImageDto: UploadImageDto,
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    return this.imageStorageService.uploadToTemp({
      file: {
        buffer: file.buffer,
        originalname: file.originalname,
        mimetype: file.mimetype,
      },
      fileName: uploadImageDto.fileName || file.originalname,
    });
  }

  @Post('confirm')
  async confirm(
    @Body(new ValidationPipe()) confirmTempUploadDto: ConfirmTempUploadDto,
  ) {
    return this.imageStorageService.confirmTempUpload({
      tempId: confirmTempUploadDto.tempId,
      folder: confirmTempUploadDto.folder,
      fileName: confirmTempUploadDto.fileName,
    });
  }
}
