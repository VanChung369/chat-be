import {
  Body,
  Controller,
  Inject,
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
  @UseInterceptors(FileFieldsInterceptor(USER_PROFILE_FILE_FIELDS))
  async updateUserProfile(
    @AuthUser() user: User,
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

    return this.userProfileService.createProfileOrUpdate(user, params);
  }
}
