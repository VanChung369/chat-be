import { Module } from '@nestjs/common';
import { UserModule } from '../users/user.module';
import { AuthController } from './controller/auth.controller';
import { AuthService } from './service/auth.service';
import { AuthenticatedGuard, LocalAuthGuard } from './guards/access.guard';
import { LocalStrategy } from './guards/local.strategy';
import { SessionSerializer } from './guards/session.serializer.js';
import { MailModule } from '../mail/mail.module.js';
import { AuthVerifyService } from './service/auth-verify.service.js';

@Module({
  imports: [UserModule, MailModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    AuthVerifyService,
    LocalAuthGuard,
    AuthenticatedGuard,
    LocalStrategy,
    SessionSerializer,
  ],
  exports: [AuthService, AuthVerifyService],
})
export class AuthModule {}
