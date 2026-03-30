import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsSelect, FindOptionsWhere, Repository } from 'typeorm';
import { BaseRepository } from '../../common/repositories';
import { User } from '../../common/entities/user.entity';

@Injectable()
export class UserRepository extends BaseRepository<User> {
  constructor(
    @InjectRepository(User)
    repository: Repository<User>,
  ) {
    super(repository);
  }

  findById(id: string): Promise<User | null> {
    return this.findOne({
      where: { id },
      relations: { profile: true },
    });
  }

  findByEmail(email: string, includePassword = false): Promise<User | null> {
    const query = this.repository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.profile', 'profile')
      .where('user.email = :email', { email });

    if (includePassword) {
      query.addSelect('user.password');
    }

    return query.getOne();
  }

  findUser(
    where: FindOptionsWhere<User>,
    select: FindOptionsSelect<User>,
  ): Promise<User | null> {
    return this.repository.findOne({
      where,
      relations: { profile: true },
      select,
    });
  }

  searchUsersByName(query: string): Promise<User[]> {
    return this.repository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.profile', 'profile')
      .where('user.name ILIKE :query', { query: `%${query}%` })
      .orderBy('user.createdAt', 'DESC')
      .take(10)
      .getMany();
  }
}
