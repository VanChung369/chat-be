import {
  Inject,
  Logger,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  Ack,
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { BaseGateway, type GatewayAck } from '../../common/gateways/base.gateway';
import { UserPresence } from '../../common/entities/user-presence.entity';
import type { User } from '../../common/entities/user.entity';
import type { AuthenticatedSocket } from '../../common/types';
import { UpdateUserPresenceDto } from '../dto/update-user-presence.dto';
import { PresenceTargetDto } from '../dto/presence-target.dto';
import { USER_PRESENCE_SERVICE_TOKEN } from '../interfaces/user-presence.service.interface';
import type { IUserPresenceService } from '../interfaces/user-presence.service.interface';
import { USER_SERVICE_TOKEN } from '../interfaces/user.service.interface';
import type { IUserService } from '../interfaces/user.service.interface';

const USER_ROOM_SCOPE = 'user';
const PRESENCE_NAMESPACE = 'presence';
const PRESENCE_SYNC_EVENT = 'presence:sync';
const PRESENCE_UPDATED_EVENT = 'presence:updated';

const gatewayValidationPipe = new ValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
});

type PresencePayload = {
  userId: string;
  room: string;
  presence: Pick<UserPresence, 'status' | 'statusMessage' | 'showOffline'>;
};

@WebSocketGateway({
  namespace: PRESENCE_NAMESPACE,
  cors: {
    origin: true,
    credentials: true,
  },
})
export class UserPresenceGateway extends BaseGateway {
  private readonly gatewayLogger = new Logger(UserPresenceGateway.name);

  constructor(
    @Inject(USER_SERVICE_TOKEN)
    private readonly userService: IUserService,
    @Inject(USER_PRESENCE_SERVICE_TOKEN)
    private readonly userPresenceService: IUserPresenceService,
  ) {
    super(UserPresenceGateway.name);
  }

  async handleConnection(client: AuthenticatedSocket): Promise<void> {
    try {
      const userId = this.requireClientUserId(client);

      super.handleConnection(client);

      const room = await this.joinScopedRoom(client, USER_ROOM_SCOPE, userId);
      const user = await this.getRequiredUser(userId);
      const presence = await this.userPresenceService.getPresence(user);
      const payload = this.toPresencePayload(userId, room, presence);

      this.emitToRoom(room, PRESENCE_SYNC_EVENT, payload);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unauthorized connection';

      this.gatewayLogger.warn(
        `Presence gateway rejected socket ${client.id}: ${message}`,
      );
      client.disconnect(true);
    }
  }

  @SubscribeMessage('presence:get')
  async handleGetCurrentPresence(
    @ConnectedSocket() client: AuthenticatedSocket,
    @Ack() ack?: GatewayAck<PresencePayload>,
  ): Promise<void> {
    try {
      const userId = this.requireClientUserId(client);
      const room = this.buildRoomKey(USER_ROOM_SCOPE, userId);
      const user = await this.getRequiredUser(userId);
      const presence = await this.userPresenceService.getPresence(user);

      this.ackSuccess(ack, this.toPresencePayload(userId, room, presence));
    } catch (error) {
      this.ackError(ack, this.getErrorMessage(error));
      throw this.toWsException(error);
    }
  }

  @SubscribeMessage('presence:update')
  @UsePipes(gatewayValidationPipe)
  async handleUpdatePresence(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: UpdateUserPresenceDto,
    @Ack() ack?: GatewayAck<PresencePayload>,
  ): Promise<void> {
    try {
      const userId = this.requireClientUserId(client);
      const user = await this.getRequiredUser(userId);
      const presence = await this.userPresenceService.createPresenceOrUpdate(
        user,
        payload,
      );
      const room = this.buildRoomKey(USER_ROOM_SCOPE, userId);
      const response = this.toPresencePayload(userId, room, presence);

      this.emitToRoom(room, PRESENCE_UPDATED_EVENT, response);
      this.ackSuccess(ack, response);
    } catch (error) {
      this.ackError(ack, this.getErrorMessage(error));
      throw this.toWsException(error);
    }
  }

  @SubscribeMessage('presence:watch')
  @UsePipes(gatewayValidationPipe)
  async handleWatchPresence(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: PresenceTargetDto,
    @Ack() ack?: GatewayAck<PresencePayload>,
  ): Promise<void> {
    try {
      const user = await this.getRequiredUser(payload.userId);
      const room = await this.joinScopedRoom(client, USER_ROOM_SCOPE, user.id);
      const presence = await this.userPresenceService.getPresence(user);

      this.ackSuccess(ack, this.toPresencePayload(user.id, room, presence));
    } catch (error) {
      this.ackError(ack, this.getErrorMessage(error));
      throw this.toWsException(error);
    }
  }

  @SubscribeMessage('presence:unwatch')
  @UsePipes(gatewayValidationPipe)
  async handleUnwatchPresence(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: PresenceTargetDto,
    @Ack() ack?: GatewayAck<{ room: string }>,
  ): Promise<void> {
    try {
      const room = this.buildRoomKey(USER_ROOM_SCOPE, payload.userId);
      await this.leaveRoom(client, room);
      this.ackSuccess(ack, { room });
    } catch (error) {
      this.ackError(ack, this.getErrorMessage(error));
      throw this.toWsException(error);
    }
  }

  private async getRequiredUser(userId: string): Promise<User> {
    const user = await this.userService.findUser({ id: userId });
    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  private toPresencePayload(
    userId: string,
    room: string,
    presence: UserPresence,
  ): PresencePayload {
    return {
      userId,
      room,
      presence: {
        status: presence.status,
        statusMessage: presence.statusMessage,
        showOffline: presence.showOffline,
      },
    };
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof Error && error.message) {
      return error.message;
    }

    return 'Internal server error';
  }
}
