import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ImageStorageService } from './image-storage.service';

@Injectable()
export class ImageStorageCleanupService {
  private readonly logger = new Logger(ImageStorageCleanupService.name);

  constructor(private readonly imageStorageService: ImageStorageService) {}

  @Cron('0 * * * *')
  async cleanup(): Promise<void> {
    try {
      await this.imageStorageService.cleanupOrphanTempUploads();
      this.logger.log('Orphan temp upload cleanup completed successfully');
    } catch (error) {
      this.logger.error('Orphan temp upload cleanup failed', error);
    }
  }
}
