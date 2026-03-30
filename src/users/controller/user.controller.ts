import {
  BadRequestException,
  ConflictException,
  Controller,
  Get,
  HttpStatus,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { AuthenticatedGuard } from '../../auth/guards/access.guard';
import { User } from '../../common/entities/user.entity';
import { UserService } from '../service/user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  @UseGuards(AuthenticatedGuard)
  me(@Req() request: Request & { user: User }): User {
    return request.user;
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
