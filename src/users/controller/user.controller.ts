import {
  BadRequestException,
  Controller,
  Get,
  HttpStatus,
  Inject,
  Patch,
  Body,
  Query,
  UseGuards,
  ConflictException,
} from '@nestjs/common';
import { AuthenticatedGuard } from '../../auth/guards/access.guard';
import { User } from '../../common/entities/user.entity';
import { USER_SERVICE_TOKEN } from '../interfaces/user.service.interface';
import type { IUserService } from '../interfaces/user.service.interface';
import { AuthUser } from 'src/common/decorators/auth-user.decorator';
import { UpdateCurrentUserDto } from '../dto/update-current-user.dto';

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

  @Patch('me')
  @UseGuards(AuthenticatedGuard)
  updateMe(
    @AuthUser() user: User,
    @Body() updateCurrentUserDto: UpdateCurrentUserDto,
  ) {
    return this.userService.updateCurrentUser(user, updateCurrentUserDto);
  }

  @Get('check')
  async checkUsername(@Query('email') email?: string) {
    if (!email?.trim()) {
      throw new BadRequestException('Invalid Query');
    }

    const user = await this.userService.findUser({ email: email.trim() });
    if (user) {
      throw new ConflictException('Email already exists');
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
