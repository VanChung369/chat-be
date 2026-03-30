import {
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';

import { User } from '../../common/entities/user.entity';
import { UserService } from '../../users/service/user.service';
import { compareHash, hashPassword } from '../../common/utils/hash';
import { RegisterDto } from '../dto/register.dto';
import { IAuthService } from '../interfaces/auth.service.interface';
import { ValidateUserLogin } from '../types';

@Injectable()
export class AuthService implements IAuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(private readonly userService: UserService) {}

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

    return createdUser;
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
