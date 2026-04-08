import { Module } from '@nestjs/common';
import { ImageStorageController } from './controller/image-storage.controller';
import { IMAGE_STORAGE_SERVICE_TOKEN } from './interfaces/image-storage.service.interface';
import { ImageStorageCleanupService } from './service/image-storage-cleanup.service';
import { ImageStorageService } from './service/image-storage.service';

@Module({
  providers: [
    ImageStorageService,
    ImageStorageCleanupService,
    { provide: IMAGE_STORAGE_SERVICE_TOKEN, useExisting: ImageStorageService },
  ],
  exports: [ImageStorageService, IMAGE_STORAGE_SERVICE_TOKEN],
  controllers: [ImageStorageController],
})
export class ImageStorageModule {}
