import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './controller/user.controller';
import { UserProfileController } from './controller/user-profile.controller';
import { UserPresenceController } from './controller/user-presence.controller';
import { User } from '../common/entities/user.entity';
import { UserRepository } from './repository/user.repository';
import { UserService } from './service/user.service';
import { Profile } from '../common/entities/profile.entity';
import { Peer } from '../common/entities/peer.entity';
import { UserProfileService } from './service/user-profile.service';
import { UserPresenceService } from './service/user-presence.service';
import { ImageStorageModule } from '../image-storage/image-storage.module';
import { UserPresence } from 'src/common/entities/user-presence.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Profile, Peer, UserPresence]),
    ImageStorageModule,
  ],
  controllers: [UserController, UserProfileController, UserPresenceController],
  providers: [UserService, UserRepository, UserProfileService, UserPresenceService],
  exports: [UserService, UserRepository, UserProfileService, UserPresenceService],
})
export class UserModule {}

