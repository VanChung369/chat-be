import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { AuthenticatedGuard } from '../../auth/guards/access.guard';
import { User } from '../entities/user.entity';

@Controller('users')
export class UserController {
  @Get('me')
  @UseGuards(AuthenticatedGuard)
  me(@Req() request: Request & { user: User }): User {
    return request.user;
  }
}
