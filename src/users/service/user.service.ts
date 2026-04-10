import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, FindOptionsSelect, FindOptionsWhere } from 'typeorm';
import { instanceToPlain } from 'class-transformer';
import {
  FindUserParams,
  FindUserOptions,
  UpdateCurrentUserParams,
} from 'src/common/types';
import { pickDefined } from '../../common/utils';
import { User } from '../../common/entities/user.entity';
import { Profile } from '../../common/entities/profile.entity';
import { UserPresence } from '../../common/entities/user-presence.entity';
import { UserRepository } from '../repository/user.repository';
import { IUserService } from '../interfaces/user.service.interface';

@Injectable()
export class UserService implements IUserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly dataSource: DataSource,
  ) {}

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
      peer: {},
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

    if (findUserParams.isVerified) {
      where.isVerified = findUserParams.isVerified;
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
          isVerified: true,
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
          isVerified: true,
          createdAt: true,
          updatedAt: true,
        };

    return this.userRepository.findUser(where, select);
  }

  searchUsers(query: string): Promise<User[]> {
    return this.userRepository.searchUsersByName(query.trim());
  }

  async verifyUser(email: string): Promise<void> {
    await this.userRepository.update({ email }, { isVerified: true });
  }

  async updatePassword(email: string, password: string): Promise<void> {
    await this.userRepository.update({ email }, { password });
  }

  async updateCurrentUser(
    user: User,
    params: UpdateCurrentUserParams,
  ): Promise<User> {
    await this.dataSource.transaction(async (manager) => {
      const currentUser = await manager.findOne(User, {
        where: { id: user.id },
        relations: { profile: true, presence: true },
      });

      if (!currentUser) {
        throw new Error('User not found');
      }

      if (!currentUser.profile) {
        const profile = manager.create(Profile);
        currentUser.profile = await manager.save(Profile, profile);
      }

      if (!currentUser.presence) {
        const presence = manager.create(UserPresence);
        currentUser.presence = await manager.save(UserPresence, presence);
      }

      Object.assign(
        currentUser,
        pickDefined({
          name: params.username?.trim(),
          firstName: params.firstName?.trim(),
          lastName: params.lastName?.trim(),
        }),
      );

      Object.assign(
        currentUser.profile,
        pickDefined({
          about: params.about?.trim(),
          phone: params.phone?.trim(),
          avatar: params.avatarUrl,
          banner: params.bannerUrl,
        }),
      );

      Object.assign(
        currentUser.presence,
        pickDefined({
          status: params.status,
          statusMessage: params.statusMessage?.trim(),
          showOffline:
            params.showOnlineStatus !== undefined
              ? !params.showOnlineStatus
              : undefined,
        }),
      );

      await manager.save(User, currentUser);
    });

    const updatedUser = await this.userRepository.findById(user.id);

    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }

    return updatedUser;
  }
}
