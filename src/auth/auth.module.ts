import { Module } from '@nestjs/common';
import { UserModule } from '../users/user.module';
import { AuthController } from './controller/auth.controller';
import { AuthService } from './service/auth.service';
import { AuthenticatedGuard, LocalAuthGuard } from './guards/access.guard';
import { LocalStrategy } from './guards/local.strategy';
import { SessionSerializer } from './guards/session.serializer';

@Module({
  imports: [UserModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    LocalAuthGuard,
    AuthenticatedGuard,
    LocalStrategy,
    SessionSerializer,
  ],
  exports: [AuthService],
})
export class AuthModule {}
