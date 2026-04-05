import {
  BadRequestException,
  ConflictException,
  Controller,
  Get,
  HttpStatus,
  Inject,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthenticatedGuard } from '../../auth/guards/access.guard';
import { User } from '../../common/entities/user.entity';
import { USER_SERVICE_TOKEN } from '../interfaces/user.service.interface';
import type { IUserService } from '../interfaces/user.service.interface';
import { AuthUser } from 'src/common/decorators/auth-user.decorator';

@Controller('users')
export class UserController {
  constructor(
    @Inject(USER_SERVICE_TOKEN)
    private readonly userService: IUserService,
  ) {}

  @Get('me')
  @UseGuards(AuthenticatedGuard)
  me(@AuthUser() user: User): User {
    return user;
  }

  @Get('check')
  async checkUsername(@Query('username') username?: string) {
    if (!username?.trim()) {
      throw new BadRequestException('Invalid Query');
    }

    const user = await this.userService.findUser({ username: username.trim() });
    if (user) {
      throw new ConflictException('Username already exists');
    }

    return HttpStatus.OK;
  }

  @Get('search')
  async searchUsers(@Query('query') query?: string) {
    if (!query?.trim()) {
      throw new BadRequestException('Provide a valid query');
    }

    return this.userService.searchUsers(query);
  }
}
