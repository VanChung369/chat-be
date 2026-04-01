import { Module } from '@nestjs/common';
import { ImageStorageService } from './image-storage.service';
import { ImageStorageController } from './image-storage.controller';

@Module({
  providers: [ImageStorageService],
  exports: [ImageStorageService],
  controllers: [ImageStorageController],
})
export class ImageStorageModule {}
