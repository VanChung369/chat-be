import { Module } from '@nestjs/common';
import { ConversationGateway } from './gateway/conversation.gateway';

@Module({
  providers: [ConversationGateway],
  exports: [ConversationGateway],
})
export class ConversationModule {}
