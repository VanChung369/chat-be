import { User } from 'src/users/entities/user.entity';
import { ValidateUserLogin } from '../types';

export interface IAuthService {
  validateUser(userCredentials: ValidateUserLogin): Promise<User | null>;
}
