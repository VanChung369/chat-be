import type { Request } from 'express';
import type { Socket } from 'socket.io';
import type { User } from '../entities/user.entity';

export interface SocketSessionPassport {
  user?: string;
}

export interface SocketSessionData {
  passport?: SocketSessionPassport;
}

export type AuthenticatedSocketSession = Request['session'] & SocketSessionData;

export interface AuthenticatedSocketRequest extends Request {
  user?: User;
  session: AuthenticatedSocketSession;
}

export interface GatewaySocketData {
  userId?: string;
}

export interface AuthenticatedSocket extends Socket {
  data: Socket['data'] & GatewaySocketData;
  handshake: Socket['handshake'] & {
    auth?: Socket['handshake']['auth'] & {
      userId?: string;
    };
    query: Socket['handshake']['query'] & {
      userId?: string | string[];
    };
    request?: AuthenticatedSocketRequest;
  };
}
