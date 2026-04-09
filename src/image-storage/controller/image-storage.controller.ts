import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Inject,
  MaxFileSizeValidator,
  FileTypeValidator,
  Param,
  ParseFilePipe,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { IMAGE_STORAGE_SERVICE_TOKEN } from '../interfaces/image-storage.service.interface';
import type { IImageStorageService } from '../interfaces/image-storage.service.interface';
import { ConfirmTempUploadDto } from '../dto/confirm-temp-upload.dto';
import { UploadImageDto } from '../dto/upload-image.dto';
import { mapUploadedFile } from '../../common/utils';
import type { RequestUploadedFile } from '../../common/utils';

const IMAGE_FILE_PIPE = new ParseFilePipe({
  validators: [
    new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }), // 10 MB
    new FileTypeValidator({ fileType: /^image\/(jpeg|png|webp|gif)$/ }),
  ],
});

@Controller('image-storage')
export class ImageStorageController {
  constructor(
    @Inject(IMAGE_STORAGE_SERVICE_TOKEN)
    private readonly imageStorageService: IImageStorageService,
  ) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @UploadedFile(IMAGE_FILE_PIPE) file: RequestUploadedFile,
    @Body() uploadImageDto: UploadImageDto,
  ) {
    return this.imageStorageService.uploadToTemp({
      file: mapUploadedFile(file),
      fileName: uploadImageDto.fileName || file.originalname,
    });
  }

  @Post('upload-direct')
  @UseInterceptors(FileInterceptor('file'))
  async uploadDirect(
    @UploadedFile(IMAGE_FILE_PIPE) file: RequestUploadedFile,
    @Body() uploadImageDto: UploadImageDto,
  ) {
    return this.imageStorageService.upload({
      file: mapUploadedFile(file),
      fileName: uploadImageDto.fileName || file.originalname,
      folder: uploadImageDto.folder,
    });
  }

  @Post('confirm')
  async confirm(@Body() confirmTempUploadDto: ConfirmTempUploadDto) {
    return this.imageStorageService.confirmTempUpload({
      tempId: confirmTempUploadDto.tempId,
      folder: confirmTempUploadDto.folder,
      fileName: confirmTempUploadDto.fileName,
    });
  }

  @Delete(':fileId')
  async delete(@Param('fileId') fileId: string) {
    return this.imageStorageService.delete(fileId);
  }
}
