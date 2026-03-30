import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(@InjectQueue('mail_queue') private readonly mailQueue: Queue) {}

  async sendVerificationEmail(email: string, code: string) {
    try {
      await this.mailQueue.add('send-verification-code', {
        email,
        code,
      });
      this.logger.log(`Verification email job added for: ${email}`);
    } catch (error) {
      this.logger.error(`Error adding mail job for ${email}: ${error.message}`);
    }
  }
}
