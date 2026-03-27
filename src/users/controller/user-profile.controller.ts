import {
  Body,
  Controller,
  Patch,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import type { Request } from 'express';
import { AuthenticatedGuard } from '../../auth/guards/access.guard';
import { USER_PROFILE_FILE_FIELDS } from '../../common/utils/constants';
import type {
  UpdateUserProfileParams,
  UserProfileFiles,
} from '../../common/utils/types';
import { UpdateUserProfileDto } from '../dto/update-user-profile.dto';
import { User } from '../entities/user.entity';
import { UserProfileService } from '../service/user-profile.service';

@UseGuards(AuthenticatedGuard)
@Controller('users/profiles')
export class UserProfileController {
  constructor(private readonly userProfileService: UserProfileService) {}

  @Patch()
  @UseInterceptors(FileFieldsInterceptor(USER_PROFILE_FILE_FIELDS))
  async updateUserProfile(
    @Req() request: Request & { user: User },
    @UploadedFiles() files: UserProfileFiles,
    @Body() updateUserProfileDto: UpdateUserProfileDto,
  ) {
    const params: UpdateUserProfileParams = {};

    if (updateUserProfileDto.about) {
      params.about = updateUserProfileDto.about;
    }

    if (files.avatar?.[0]) {
      params.avatar = files.avatar[0];
    }

    if (files.banner?.[0]) {
      params.banner = files.banner[0];
    }

    return this.userProfileService.createProfileOrUpdate(request.user, params);
  }
}
