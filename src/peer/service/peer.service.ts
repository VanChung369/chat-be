import { Injectable } from '@nestjs/common';
import { PeerRepository } from '../repository/peer.repository';
import { User } from '../../common/entities/user.entity';
import { Peer } from '../../common/entities/peer.entity';

@Injectable()
export class PeerService {
  constructor(private readonly peerRepository: PeerRepository) {}

  async create(user: User): Promise<Peer> {
    const peer = this.peerRepository.create({ user });
    return await this.peerRepository.save(peer);
  }
}
