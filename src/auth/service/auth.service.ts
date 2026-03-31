import {
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import { AuthVerifyService } from './auth-verify.service.js';

import { User } from '../../common/entities/user.entity';
import { UserService } from '../../users/service/user.service';
import { compareHash, hashPassword } from '../../common/utils/hash';
import { RegisterDto } from '../dto/register.dto';
import { IAuthService } from '../interfaces/auth.service.interface';
import { ValidateUserLogin } from '../types';

@Injectable()
export class AuthService implements IAuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly userService: UserService,
    private readonly authVerifyService: AuthVerifyService,
  ) {}

  async register(registerDto: RegisterDto) {
    this.logger.log(`Register attempt for email: ${registerDto.email}`);

    const existingUserByEmail = await this.userService.findUser(
      { email: registerDto.email },
      { selectAll: false },
    );
    if (existingUserByEmail) {
      throw new ConflictException('Email already exists');
    }

    const password = await hashPassword(registerDto.password);
    const createdUser = await this.userService.createUser({
      username: registerDto.username,
      firstName: registerDto.firstName,
      lastName: registerDto.lastName,
      email: registerDto.email,
      password,
    });

    // Send verification code to queue
    await this.authVerifyService.sendVerificationCode(registerDto.email);

    return createdUser;
  }

  async verifyEmail(email: string, code: string): Promise<boolean> {
    const isValid = await this.authVerifyService.verifyCode(email, code);
    if (isValid) {
      await this.userService.verifyUser(email);
      return true;
    }
    return false;
  }

  async resendVerificationCode(email: string): Promise<void> {
    const user = await this.userService.findUser({ email });
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    await this.authVerifyService.sendVerificationCode(email);
  }

  async validateUser(userCredentials: ValidateUserLogin): Promise<User | null> {
    this.logger.log(
      `Login validation attempt for email: ${userCredentials.email}`,
    );

    const user = await this.userService.findUser(
      { email: userCredentials.email },
      { selectAll: true },
    );

    if (!user) {
      throw new HttpException('Invalid Credentials', HttpStatus.UNAUTHORIZED);
    }

    if (!user.isVerified) {
      throw new HttpException('User not verified', HttpStatus.FORBIDDEN);
    }

    const isPasswordValid = await compareHash(
      userCredentials.password,
      user.password,
    );

    if (!isPasswordValid) {
      return null;
    }

    return isPasswordValid ? user : null;
  }
}
