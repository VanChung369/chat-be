import { User } from '../../common/entities/user.entity';
import { ValidateUserLogin } from '../types';
import { RegisterDto } from '../dto/register.dto';

export const AUTH_SERVICE_TOKEN = Symbol('AUTH_SERVICE_TOKEN');

export interface IAuthService {
  validateUser(userCredentials: ValidateUserLogin): Promise<User | null>;
  register(registerDto: RegisterDto): Promise<unknown>;
  verifyEmail(email: string, code: string): Promise<boolean>;
  resendVerificationCode(email: string): Promise<void>;
  forgotPassword(email: string): Promise<void>;
  resetPassword(email: string, code: string, newPassword: string): Promise<void>;
}
