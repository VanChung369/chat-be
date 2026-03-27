import { FindUserOptions, FindUserParams } from '../../common/utils/types';
import { User } from '../entities/user.entity';

export interface IUserService {
  findUser(
    findUserParams: FindUserParams,
    options?: FindUserOptions,
  ): Promise<User | null>;

  createUser(userDetails: {
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }): Promise<Partial<User>>;
}
