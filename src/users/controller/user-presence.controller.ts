import {
  Body,
  Controller,
  Get,
  Inject,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { AuthenticatedGuard } from '../../auth/guards/access.guard';
import { UpdateUserPresenceParams } from '../../common/types';
import { User } from '../../common/entities/user.entity';
import { UpdateUserPresenceDto } from '../dto/update-user-presence.dto';
import { USER_PRESENCE_SERVICE_TOKEN } from '../interfaces/user-presence.service.interface';
import type { IUserPresenceService } from '../interfaces/user-presence.service.interface';
import { AuthUser } from 'src/common/decorators/auth-user.decorator';

@UseGuards(AuthenticatedGuard)
@Controller('users/presence')
export class UserPresenceController {
  constructor(
    @Inject(USER_PRESENCE_SERVICE_TOKEN)
    private readonly userPresenceService: IUserPresenceService,
  ) {}

  @Get()
  getUserPresence(@AuthUser() user: User) {
    return this.userPresenceService.getPresence(user);
  }

  @Patch()
  updateUserPresence(
    @AuthUser() user: User,
    @Body() updateUserPresenceDto: UpdateUserPresenceDto,
  ) {
    const params: UpdateUserPresenceParams = {};

    if (typeof updateUserPresenceDto.statusMessage === 'string') {
      params.statusMessage = updateUserPresenceDto.statusMessage.trim();
    }

    if (typeof updateUserPresenceDto.showOffline === 'boolean') {
      params.showOffline = updateUserPresenceDto.showOffline;
    }

    return this.userPresenceService.createPresenceOrUpdate(user, params);
  }
}
