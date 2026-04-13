import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PeerService } from './service/peer.service';
import { PeerRepository } from './repository/peer.repository';
import { Peer } from '../common/entities/peer.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Peer])],
  providers: [PeerService, PeerRepository],
  exports: [PeerService, PeerRepository],
})
export class PeerModule {}
