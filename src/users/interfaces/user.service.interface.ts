import { FindUserOptions, FindUserParams } from 'src/common/types';
import { User } from '../../common/entities/user.entity';

export const USER_SERVICE_TOKEN = Symbol('USER_SERVICE_TOKEN');

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

  searchUsers(query: string): Promise<User[]>;
  verifyUser(email: string): Promise<void>;
  updatePassword(email: string, password: string): Promise<void>;
}
