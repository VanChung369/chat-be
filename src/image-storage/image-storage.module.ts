import { Module } from '@nestjs/common';
import { ImageStorageService } from './image-storage.service';
import { ImageStorageController } from './image-storage.controller';
import { IMAGE_STORAGE_SERVICE_TOKEN } from './image-storage';

@Module({
  providers: [
    ImageStorageService,
    { provide: IMAGE_STORAGE_SERVICE_TOKEN, useExisting: ImageStorageService },
  ],
  exports: [ImageStorageService, IMAGE_STORAGE_SERVICE_TOKEN],
  controllers: [ImageStorageController],
})
export class ImageStorageModule {}
