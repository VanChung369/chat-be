import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './controller/user.controller';
import { UserProfileController } from './controller/user-profile.controller';
import { User } from '../common/entities/user.entity';
import { UserRepository } from './repository/user.repository';
import { UserService } from './service/user.service';
import { Profile } from '../common/entities/profile.entity';
import { Peer } from '../common/entities/peer.entity';
import { UserProfileService } from './service/user-profile.service';
import { ImageStorageModule } from '../image-storage/image-storage.module';

@Module({
  imports: [TypeOrmModule.forFeature([User, Profile, Peer]), ImageStorageModule],
  controllers: [UserController, UserProfileController],
  providers: [UserService, UserRepository, UserProfileService],
  exports: [UserService, UserRepository, UserProfileService],
})
export class UserModule {}
