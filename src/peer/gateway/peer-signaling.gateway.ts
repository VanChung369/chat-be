import { Logger } from '@nestjs/common';
import { WebSocketGateway } from '@nestjs/websockets';
import { BaseGateway } from '../../common/gateways/base.gateway';
import type { AuthenticatedSocket } from '../../common/types';

const PEER_SIGNALING_NAMESPACE = 'peer';

@WebSocketGateway({
  namespace: PEER_SIGNALING_NAMESPACE,
  cors: {
    origin: true,
    credentials: true,
  },
})
export class PeerSignalingGateway extends BaseGateway {
  private readonly gatewayLogger = new Logger(PeerSignalingGateway.name);

  constructor() {
    super(PeerSignalingGateway.name);
  }

  async handleConnection(client: AuthenticatedSocket): Promise<void> {
    try {
      this.requireClientUserId(client);
      super.handleConnection(client);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unauthorized connection';

      this.gatewayLogger.warn(
        `Peer signaling gateway rejected socket ${client.id}: ${message}`,
      );
      client.disconnect(true);
    }
  }
}
