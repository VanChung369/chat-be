import { Processor, WorkerHost } from '@nestjs/bullmq';
import { MailerService } from '@nestjs-modules/mailer';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';

@Processor('mail_queue')
export class MailProcessor extends WorkerHost {
  private readonly logger = new Logger(MailProcessor.name);

  constructor(private readonly mailerService: MailerService) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.log(`Processing job ${job.id} of type ${job.name}`);

    try {
      switch (job.name) {
        case 'send-verification-code': {
          const { email, code } = job.data;
          await this.mailerService.sendMail({
            to: email,
            subject: 'Verify your email',
            template: 'verification',
            context: {
              code,
            },
          });
          this.logger.log(`Verification email sent successfully to: ${email}`);
          break;
        }
        default:
          this.logger.warn(`Unknown job name: ${job.name}`);
          break;
      }
    } catch (error) {
      this.logger.error(`Failed to process job ${job.id}: ${error.message}`);
      throw error;
    }
  }
}
