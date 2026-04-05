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
import { IMAGE_STORAGE_SERVICE_TOKEN } from './image-storage';
import type { IImageStorageService } from './image-storage';
import { UploadImageDto } from './dto/upload-image.dto';

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

    return this.imageStorageService.upload({
      file: {
        buffer: file.buffer,
        originalname: file.originalname,
        mimetype: file.mimetype,
      },
      fileName: uploadImageDto.fileName,
      folder: uploadImageDto.folder,
    });
  }
}
