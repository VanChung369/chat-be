import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { UpdateUserPresenceParams } from '../../common/types';
import { pickDefined } from '../../common/utils';
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
    private readonly dataSource: DataSource,
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

    await this.dataSource.transaction(async (manager) => {
      const existing = await manager.findOne(UserPresence, {
        where: { user: { id: user.id } } as any,
      });
      if (existing) {
        user.presence = existing;
        return;
      }
      const presence = manager.create(UserPresence);
      user.presence = await manager.save(UserPresence, presence);
      await manager.save(User, user);
    });

    return user.presence!;
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

    Object.assign(
      presence,
      pickDefined({
        status: params.status,
        statusMessage: params.statusMessage,
        showOffline: params.showOffline,
      }),
    );

    return this.userPresenceRepository.save(presence);
  }
}
