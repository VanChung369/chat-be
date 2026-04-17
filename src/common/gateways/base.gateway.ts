import { Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WsException,
} from '@nestjs/websockets';
import type { Namespace, Server } from 'socket.io';
import type { User } from '../entities/user.entity';
import type { AuthenticatedSocket } from '../types/socket';

export type GatewayAckResponse<T = unknown> =
  | { ok: true; data: T }
  | { ok: false; error: string; details?: unknown };

export type GatewayAck<T = unknown> = (response: GatewayAckResponse<T>) => void;

export abstract class BaseGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  protected readonly logger: Logger;
  protected server?: Namespace | Server;

  protected constructor(contextName: string) {
    this.logger = new Logger(contextName);
  }

  afterInit(server: Namespace | Server): void {
    this.server = server;
    this.logger.log('Gateway initialized');
  }

  handleConnection(client: AuthenticatedSocket): void {
    const userId = this.bindClientUserId(client);
    this.logger.log(this.getConnectionLogMessage('connected', client, userId));
  }

  handleDisconnect(client: AuthenticatedSocket): void {
    this.logger.log(
      this.getConnectionLogMessage('disconnected', client, client.data.userId),
    );
  }

  protected getClientRequest(client: AuthenticatedSocket) {
    return client.handshake.request;
  }

  protected getClientUser(client: AuthenticatedSocket): User | undefined {
    return this.getClientRequest(client)?.user;
  }

  protected getClientUserId(client: AuthenticatedSocket): string | undefined {
    const cachedUserId = client.data.userId;
    if (this.isNonEmptyString(cachedUserId)) {
      return cachedUserId;
    }

    const requestUserId = this.getClientUser(client)?.id;
    if (this.isNonEmptyString(requestUserId)) {
      return requestUserId;
    }

    const sessionUserId = this.getClientRequest(client)?.session?.passport?.user;
    if (this.isNonEmptyString(sessionUserId)) {
      return sessionUserId;
    }

    const authUserId = client.handshake.auth?.userId;
    if (this.isNonEmptyString(authUserId)) {
      return authUserId;
    }

    return this.getQueryUserId(client);
  }

  protected requireClientUserId(client: AuthenticatedSocket): string {
    const userId = this.bindClientUserId(client);
    if (!userId) {
      throw new WsException('Unauthorized');
    }
    return userId;
  }

  protected bindClientUserId(
    client: AuthenticatedSocket,
  ): string | undefined {
    const userId = this.getClientUserId(client);
    if (userId) {
      client.data.userId = userId;
    }
    return userId;
  }

  protected buildRoomKey(
    scope: string,
    identifier: string | number,
  ): string {
    return `${scope}:${identifier}`;
  }

  protected async joinRoom(
    client: AuthenticatedSocket,
    room: string,
  ): Promise<void> {
    await client.join(room);
  }

  protected async leaveRoom(
    client: AuthenticatedSocket,
    room: string,
  ): Promise<void> {
    await client.leave(room);
  }

  protected async joinScopedRoom(
    client: AuthenticatedSocket,
    scope: string,
    identifier: string | number,
  ): Promise<string> {
    const room = this.buildRoomKey(scope, identifier);
    await client.join(room);
    return room;
  }

  protected emitToRoom(room: string, event: string, payload: unknown): void {
    this.server?.to(room).emit(event, payload);
  }

  protected acknowledge<T>(
    ack: GatewayAck<T> | undefined,
    response: GatewayAckResponse<T>,
  ): void {
    ack?.(response);
  }

  protected ackSuccess<T>(ack: GatewayAck<T> | undefined, data: T): void {
    this.acknowledge(ack, { ok: true, data });
  }

  protected ackError<T = unknown>(
    ack: GatewayAck<T> | undefined,
    error: string,
    details?: unknown,
  ): void {
    this.acknowledge(ack, {
      ok: false,
      error,
      ...(details === undefined ? {} : { details }),
    });
  }

  protected toWsException(
    error: unknown,
    fallbackMessage = 'Internal server error',
  ): WsException {
    if (error instanceof WsException) {
      return error;
    }

    if (error instanceof Error && this.isNonEmptyString(error.message)) {
      return new WsException(error.message);
    }

    if (this.isNonEmptyString(error)) {
      return new WsException(error);
    }

    return new WsException(fallbackMessage);
  }

  private getQueryUserId(client: AuthenticatedSocket): string | undefined {
    const queryUserId = client.handshake.query?.userId;
    if (Array.isArray(queryUserId)) {
      return queryUserId.find((value) => this.isNonEmptyString(value));
    }

    return this.isNonEmptyString(queryUserId) ? queryUserId : undefined;
  }

  private getConnectionLogMessage(
    status: 'connected' | 'disconnected',
    client: AuthenticatedSocket,
    userId?: string,
  ): string {
    return userId
      ? `Client ${status}: ${client.id} (user: ${userId})`
      : `Client ${status}: ${client.id}`;
  }

  private isNonEmptyString(value: unknown): value is string {
    return typeof value === 'string' && value.trim().length > 0;
  }
}
