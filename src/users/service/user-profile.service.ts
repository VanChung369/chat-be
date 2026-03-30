import { randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateUserProfileParams } from '../../common/utils/types';
import { ImageStorageService } from '../../image-storage/image-storage.service';
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
    private readonly imageStorageService: ImageStorageService,
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
