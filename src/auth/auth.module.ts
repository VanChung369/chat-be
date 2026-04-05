import { Module } from '@nestjs/common';
import { UserModule } from '../users/user.module';
import { AuthController } from './controller/auth.controller';
import { AuthService } from './service/auth.service';
import { AuthenticatedGuard, LocalAuthGuard } from './guards/access.guard';
import { LocalStrategy } from './guards/local.strategy';
import { SessionSerializer } from './guards/session.serializer.js';
import { MailModule } from '../mail/mail.module.js';
import { AuthVerifyService } from './service/auth-verify.service.js';
import { AUTH_SERVICE_TOKEN } from './interfaces/auth.service.interface';

@Module({
  imports: [UserModule, MailModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    { provide: AUTH_SERVICE_TOKEN, useExisting: AuthService },
    AuthVerifyService,
    LocalAuthGuard,
    AuthenticatedGuard,
    LocalStrategy,
    SessionSerializer,
  ],
  exports: [AuthService, AUTH_SERVICE_TOKEN, AuthVerifyService],
})
export class AuthModule {}
