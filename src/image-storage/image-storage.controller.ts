import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Body,
  ValidationPipe,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImageStorageService } from './image-storage.service';
import { UploadImageDto } from './dto/upload-image.dto';

@Controller('image-storage')
export class ImageStorageController {
  constructor(private readonly imageStorageService: ImageStorageService) {}

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
