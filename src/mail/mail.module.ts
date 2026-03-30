import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/adapters/handlebars.adapter';
import { BullModule } from '@nestjs/bullmq';
import { join } from 'path';
import { MailService } from './service/mail.service.js';
import { MailProcessor } from './processor/mail.processor.js';

@Module({
  imports: [
    MailerModule.forRootAsync({
      useFactory: () => ({
        transport: {
          host: process.env.MAIL_HOST,
          port: parseInt(process.env.MAIL_PORT || '587', 10),
          secure: false,
          auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASSWORD,
          },
        },
        defaults: {
          from: process.env.MAIL_FROM,
        },
        template: {
          dir: join(__dirname, 'templates'),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
    }),
    BullModule.registerQueue({
      name: 'mail_queue',
    }),
  ],
  providers: [MailService, MailProcessor],
  exports: [MailService],
})
export class MailModule {}
