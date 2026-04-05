import { randomUUID } from 'node:crypto';
import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateUserProfileParams } from '../../common/utils/types';
import { IMAGE_STORAGE_SERVICE_TOKEN } from '../../image-storage/image-storage';
import type { IImageStorageService } from '../../image-storage/image-storage';
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
    @Inject(IMAGE_STORAGE_SERVICE_TOKEN)
    private readonly imageStorageService: IImageStorageService,
  ) {}

  private async ensureProfile(user: User): Promise<void> {
    if (user.profile) {
      return;
    }

    user.profile = await this.profileRepository.save(
      this.profileRepository.create(),
    );
  }

  async createProfileOrUpdate(
    user: User,
    params: UpdateUserProfileParams,
  ): Promise<User> {
    await this.ensureProfile(user);

    if (!user.profile) {
      throw new Error('Profile could not be created');
    }

    if (params.avatar) {
      const uploadedAvatar = await this.imageStorageService.upload({
        file: params.avatar,
        fileName: `avatar-${user.id}-${randomUUID()}`,
        folder: '/chat-app/avatars',
      });
      user.profile.avatar = uploadedAvatar.url;
    }

    if (params.banner) {
      const uploadedBanner = await this.imageStorageService.upload({
        file: params.banner,
        fileName: `banner-${user.id}-${randomUUID()}`,
        folder: '/chat-app/banners',
      });
      user.profile.banner = uploadedBanner.url;
    }

    if (typeof params.about === 'string') {
      user.profile.about = params.about;
    }

    return this.userRepository.save(user);
  }
}


