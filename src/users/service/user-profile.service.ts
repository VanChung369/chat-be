import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { UpdateUserProfileParams } from '../../common/types';
import { Profile } from '../../common/entities/profile.entity';
import { User } from '../../common/entities/user.entity';
import { UserRepository } from '../repository/user.repository';
import { IUserProfileService } from '../interfaces/user-profile.service.interface';

@Injectable()
export class UserProfileService implements IUserProfileService {
  constructor(
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
    private readonly userRepository: UserRepository,
    private readonly dataSource: DataSource,
  ) {}

  private async ensureProfile(user: User): Promise<void> {
    if (user.profile) {
      return;
    }

    await this.dataSource.transaction(async (manager) => {
      const existing = await manager.findOne(Profile, {
        where: { user: { id: user.id } } as any,
      });
      if (existing) {
        user.profile = existing;
        return;
      }
      const profile = manager.create(Profile);
      user.profile = await manager.save(Profile, profile);
      await manager.save(User, user);
    });
  }

  async createProfileOrUpdate(
    user: User,
    params: UpdateUserProfileParams,
  ): Promise<User> {
    await this.ensureProfile(user);

    if (!user.profile) {
      throw new Error('Profile could not be created');
    }

    if (typeof params.avatarUrl === 'string') {
      user.profile.avatar = params.avatarUrl;
    }

    if (typeof params.bannerUrl === 'string') {
      user.profile.banner = params.bannerUrl;
    }

    if (typeof params.about === 'string') {
      user.profile.about = params.about;
    }

    return this.userRepository.save(user);
  }
}
