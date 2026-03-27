import { UpdateUserProfileParams } from '../../common/utils/types';
import { User } from '../entities/user.entity';

export interface IUserProfileService {
  createProfileOrUpdate(
    user: User,
    params: UpdateUserProfileParams,
  ): Promise<User>;
}
