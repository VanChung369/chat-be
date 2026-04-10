import { Inject, Injectable } from '@nestjs/common';
import { UpdateUserProfileParams } from '../../common/types';
import { User } from '../../common/entities/user.entity';
import { IUserProfileService } from '../interfaces/user-profile.service.interface';
import {
  USER_SERVICE_TOKEN,
} from '../interfaces/user.service.interface';
import type { IUserService } from '../interfaces/user.service.interface';

@Injectable()
export class UserProfileService implements IUserProfileService {
  constructor(
    @Inject(USER_SERVICE_TOKEN)
    private readonly userService: IUserService,
  ) {}

  async createProfileOrUpdate(
    user: User,
    params: UpdateUserProfileParams,
  ): Promise<User> {
    return this.userService.updateCurrentUser(user, params);
  }
}
