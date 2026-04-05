import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateUserPresenceParams } from '../../common/utils/types';
import { UserPresence } from '../../common/entities/user-presence.entity';
import { User } from '../../common/entities/user.entity';
import { UserRepository } from '../repository/user.repository';
import { IUserPresenceService } from '../interfaces/user-presence.service.interface';

@Injectable()
export class UserPresenceService implements IUserPresenceService {
  constructor(
    @InjectRepository(UserPresence)
    private readonly userPresenceRepository: Repository<UserPresence>,
    private readonly userRepository: UserRepository,
  ) {}

  private async getUserWithPresence(userId: string): Promise<User> {
    const currentUser = await this.userRepository.findById(userId);

    if (!currentUser) {
      throw new NotFoundException('User not found');
    }

    return currentUser;
  }

  private async ensurePresence(user: User): Promise<UserPresence> {
    if (user.presence) {
      return user.presence;
    }

    user.presence = await this.userPresenceRepository.save(
      this.userPresenceRepository.create(),
    );

    await this.userRepository.save(user);

    return user.presence;
  }

  async getPresence(user: User): Promise<UserPresence> {
    const currentUser = await this.getUserWithPresence(user.id);

    return this.ensurePresence(currentUser);
  }

  async createPresenceOrUpdate(
    user: User,
    params: UpdateUserPresenceParams,
  ): Promise<UserPresence> {
    const currentUser = await this.getUserWithPresence(user.id);
    const presence = await this.ensurePresence(currentUser);

    if (typeof params.statusMessage === 'string') {
      presence.statusMessage = params.statusMessage;
    }

    if (typeof params.showOffline === 'boolean') {
      presence.showOffline = params.showOffline;
    }

    currentUser.presence = await this.userPresenceRepository.save(presence);
    await this.userRepository.save(currentUser);

    return currentUser.presence;
  }
}
