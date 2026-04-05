import { Inject, Injectable } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';
import { User } from '../../common/entities/user.entity';
import { USER_SERVICE_TOKEN } from '../../users/interfaces/user.service.interface';
import type { IUserService } from '../../users/interfaces/user.service.interface';

type SerializeDone = (error: Error | null, userId?: string) => void;
type DeserializeDone = (error: Error | null, user?: User | null) => void;

@Injectable()
export class SessionSerializer extends PassportSerializer {
  constructor(
    @Inject(USER_SERVICE_TOKEN)
    private readonly userService: IUserService,
  ) {
    super();
  }

  serializeUser(user: User, done: SerializeDone): void {
    done(null, user.id);
  }

  async deserializeUser(userId: string, done: DeserializeDone): Promise<void> {
    const userDb = await this.userService.findUser({ id: userId });
    done(null, userDb);
  }
}


