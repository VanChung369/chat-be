import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from '../../common/repositories';
import { Peer } from '../../common/entities/peer.entity';

@Injectable()
export class PeerRepository extends BaseRepository<Peer> {
  constructor(
    @InjectRepository(Peer)
    repository: Repository<Peer>,
  ) {
    super(repository);
  }
}
