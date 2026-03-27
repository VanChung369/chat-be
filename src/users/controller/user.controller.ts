import { Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { UserService } from '../service/user.service';
import { AuthenticatedGuard } from 'src/auth/guards/access.guard';
import { User } from '../entities/user.entity';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  @UseGuards(AuthenticatedGuard)
  async me(@Req() request: Request & { user: User }) {
    return request.user;
  }
}
