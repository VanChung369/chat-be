import {
  Body,
  Controller,
  Inject,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { AuthenticatedGuard } from '../../auth/guards/access.guard';
import type { UpdateUserProfileParams } from '../../common/types';
import { UpdateUserProfileDto } from '../dto/update-user-profile.dto';
import { User } from '../../common/entities/user.entity';
import { USER_PROFILE_SERVICE_TOKEN } from '../interfaces/user-profile.service.interface';
import type { IUserProfileService } from '../interfaces/user-profile.service.interface';
import { AuthUser } from 'src/common/decorators/auth-user.decorator';

@UseGuards(AuthenticatedGuard)
@Controller('users/profiles')
export class UserProfileController {
  constructor(
    @Inject(USER_PROFILE_SERVICE_TOKEN)
    private readonly userProfileService: IUserProfileService,
  ) {}

  @Patch()
  async updateUserProfile(
    @AuthUser() user: User,
    @Body() updateUserProfileDto: UpdateUserProfileDto,
  ) {
    const params: UpdateUserProfileParams = {};

    if (typeof updateUserProfileDto.about === 'string') {
      params.about = updateUserProfileDto.about;
    }

    if (typeof updateUserProfileDto.avatarUrl === 'string') {
      params.avatarUrl = updateUserProfileDto.avatarUrl;
    }

    if (typeof updateUserProfileDto.bannerUrl === 'string') {
      params.bannerUrl = updateUserProfileDto.bannerUrl;
    }

    return this.userProfileService.createProfileOrUpdate(user, params);
  }
}
