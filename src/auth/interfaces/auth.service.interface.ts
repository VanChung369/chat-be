import { User } from '../../users/entities/user.entity';
import { ValidateUserLogin } from '../types';

export interface IAuthService {
  validateUser(userCredentials: ValidateUserLogin): Promise<User | null>;
}
