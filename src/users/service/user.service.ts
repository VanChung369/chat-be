import { Injectable } from '@nestjs/common';
import { FindOptionsSelect, FindOptionsWhere } from 'typeorm';
import { instanceToPlain } from 'class-transformer';
import { FindUserOptions, FindUserParams } from '../../common/utils/types';
import { User } from '../entities/user.entity';
import { UserRepository } from '../repository/user.repository';
import { IUserService } from '../interfaces/user.service.interface';

@Injectable()
export class UserService implements IUserService {
  constructor(private readonly userRepository: UserRepository) {}

  async createUser(params: {
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) {
    const user = this.userRepository.create({
      name: params.username,
      firstName: params.firstName,
      lastName: params.lastName,
      email: params.email,
      password: params.password,
    });

    return instanceToPlain(await this.userRepository.save(user));
  }

  async findUser(
    findUserParams: FindUserParams,
    options?: FindUserOptions,
  ): Promise<User | null> {
    const where: FindOptionsWhere<User> = {};

    if (findUserParams.id) {
      where.id = String(findUserParams.id);
    }

    if (findUserParams.email) {
      where.email = findUserParams.email;
    }

    if (findUserParams.username) {
      where.name = findUserParams.username;
    }

    if (Object.keys(where).length === 0) {
      return null;
    }

    const select: FindOptionsSelect<User> = options?.selectAll
      ? {
          id: true,
          name: true,
          email: true,
          firstName: true,
          lastName: true,
          password: true,
          createdAt: true,
          updatedAt: true,
        }
      : {
          id: true,
          name: true,
          email: true,
          firstName: true,
          lastName: true,
          createdAt: true,
          updatedAt: true,
        };

    return this.userRepository.findUser(where, select);
  }

  searchUsers(query: string): Promise<User[]> {
    return this.userRepository.searchUsersByName(query.trim());
  }
}
