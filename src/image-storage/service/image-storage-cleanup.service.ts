import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ImageStorageService } from './image-storage.service';

@Injectable()
export class ImageStorageCleanupService {
  constructor(private readonly imageStorageService: ImageStorageService) {}

  @Cron('0 * * * *')
  async cleanup(): Promise<void> {
    await this.imageStorageService.cleanupOrphanTempUploads();
  }
}
