import {
  ConflictException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { AuthVerifyService } from './auth-verify.service.js';

import { User } from '../../common/entities/user.entity';
import { USER_SERVICE_TOKEN } from '../../users/interfaces/user.service.interface';
import type { IUserService } from '../../users/interfaces/user.service.interface';
import { compareHash, hashPassword } from '../../common/utils';
import { RegisterDto } from '../dto/register.dto';
import { IAuthService } from '../interfaces/auth.service.interface';
import { ValidateUserLogin } from '../types';

@Injectable()
export class AuthService implements IAuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @Inject(USER_SERVICE_TOKEN)
    private readonly userService: IUserService,
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

  async forgotPassword(email: string): Promise<void> {
    const user = await this.userService.findUser({ email });
    if (!user) {
      // Silently ignore to prevent email enumeration
      return;
    }
    await this.authVerifyService.sendResetPasswordCode(email);
  }

  async resetPassword(
    email: string,
    code: string,
    newPassword: string,
  ): Promise<void> {
    const isValid = await this.authVerifyService.verifyResetCode(email, code);
    if (!isValid) {
      throw new HttpException(
        'Invalid or expired code',
        HttpStatus.BAD_REQUEST,
      );
    }

    const hashedPassword = await hashPassword(newPassword);
    await this.userService.updatePassword(email, hashedPassword);
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
