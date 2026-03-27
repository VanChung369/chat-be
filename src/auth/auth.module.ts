import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { AuthController } from './controller/auth.controller';
import { AuthService } from './service/auth.service';
import { Profile } from 'src/users/entities/profile.entity';
import { AuthenticatedGuard, LocalAuthGuard } from './guards/access.guard';
import { LocalStrategy } from './guards/local.strategy';
import { SessionSerializer } from './guards/session.serializer';
import { UserModule } from 'src/users/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([User, Profile]), UserModule],
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
