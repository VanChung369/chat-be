import { Logger } from '@nestjs/common';
import { WebSocketGateway } from '@nestjs/websockets';
import { BaseGateway } from '../../common/gateways/base.gateway';
import type { AuthenticatedSocket } from '../../common/types';

const CONVERSATION_NAMESPACE = 'conversations';

@WebSocketGateway({
  namespace: CONVERSATION_NAMESPACE,
  cors: {
    origin: true,
    credentials: true,
  },
})
export class ConversationGateway extends BaseGateway {
  private readonly gatewayLogger = new Logger(ConversationGateway.name);

  constructor() {
    super(ConversationGateway.name);
  }

  async handleConnection(client: AuthenticatedSocket): Promise<void> {
    try {
      this.requireClientUserId(client);
      super.handleConnection(client);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unauthorized connection';

      this.gatewayLogger.warn(
        `Conversation gateway rejected socket ${client.id}: ${message}`,
      );
      client.disconnect(true);
    }
  }
}
