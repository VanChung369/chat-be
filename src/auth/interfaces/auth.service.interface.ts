import { User } from '../../common/entities/user.entity';
import { ValidateUserLogin } from '../types';
import { RegisterDto } from '../dto/register.dto';

export interface IAuthService {
  validateUser(userCredentials: ValidateUserLogin): Promise<User | null>;
  register(registerDto: RegisterDto): Promise<any>;
  verifyEmail(email: string, code: string): Promise<boolean>;
  resendVerificationCode(email: string): Promise<void>;
}
