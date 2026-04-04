import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { AuthenticatedGuard } from '../../auth/guards/access.guard';
import { UpdateUserPresenceParams } from '../../common/utils/types';
import { User } from '../../common/entities/user.entity';
import { UpdateUserPresenceDto } from '../dto/update-user-presence.dto';
import { UserPresenceService } from '../service/user-presence.service';

@UseGuards(AuthenticatedGuard)
@Controller('users/presence')
export class UserPresenceController {
  constructor(private readonly userPresenceService: UserPresenceService) {}

  @Get()
  getUserPresence(@Req() request: Request & { user: User }) {
    return this.userPresenceService.getPresence(request.user);
  }

  @Patch()
  updateUserPresence(
    @Req() request: Request & { user: User },
    @Body() updateUserPresenceDto: UpdateUserPresenceDto,
  ) {
    const params: UpdateUserPresenceParams = {};

    if (typeof updateUserPresenceDto.statusMessage === 'string') {
      params.statusMessage = updateUserPresenceDto.statusMessage.trim();
    }

    if (typeof updateUserPresenceDto.showOffline === 'boolean') {
      params.showOffline = updateUserPresenceDto.showOffline;
    }

    return this.userPresenceService.createPresenceOrUpdate(request.user, params);
  }
}
