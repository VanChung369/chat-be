import { UpdateUserProfileParams } from '../../common/utils/types';
import { User } from '../../common/entities/user.entity';

export const USER_PROFILE_SERVICE_TOKEN = Symbol('USER_PROFILE_SERVICE_TOKEN');

export interface IUserProfileService {
  createProfileOrUpdate(
    user: User,
    params: UpdateUserProfileParams,
  ): Promise<User>;
}
