import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PeerService } from './service/peer.service';
import { PeerRepository } from './repository/peer.repository';
import { Peer } from '../common/entities/peer.entity';
import { PeerSignalingGateway } from './gateway/peer-signaling.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([Peer])],
  providers: [PeerService, PeerRepository, PeerSignalingGateway],
  exports: [PeerService, PeerRepository, PeerSignalingGateway],
})
export class PeerModule {}
