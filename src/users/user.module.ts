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
import { UserPresence } from 'src/common/entities/user-presence.entity';
import { USER_SERVICE_TOKEN } from './interfaces/user.service.interface';
import { USER_PROFILE_SERVICE_TOKEN } from './interfaces/user-profile.service.interface';
import { USER_PRESENCE_SERVICE_TOKEN } from './interfaces/user-presence.service.interface';
import { UserPresenceGateway } from './gateway/user-presence.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([User, Profile, Peer, UserPresence])],
  controllers: [UserController, UserProfileController, UserPresenceController],
  providers: [
    UserService,
    UserRepository,
    UserProfileService,
    UserPresenceService,
    UserPresenceGateway,
    { provide: USER_SERVICE_TOKEN, useExisting: UserService },
    { provide: USER_PROFILE_SERVICE_TOKEN, useExisting: UserProfileService },
    { provide: USER_PRESENCE_SERVICE_TOKEN, useExisting: UserPresenceService },
  ],
  exports: [
    UserRepository,
    UserService,
    UserProfileService,
    UserPresenceService,
    USER_SERVICE_TOKEN,
    USER_PROFILE_SERVICE_TOKEN,
    USER_PRESENCE_SERVICE_TOKEN,
  ],
})
export class UserModule {}
