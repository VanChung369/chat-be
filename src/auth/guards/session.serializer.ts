import { Injectable } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';
import { User } from '../../users/entities/user.entity';
import { UserService } from '../../users/service/user.service';

type SerializeDone = (error: Error | null, userId?: string) => void;
type DeserializeDone = (error: Error | null, user?: User | null) => void;

@Injectable()
export class SessionSerializer extends PassportSerializer {
  constructor(private readonly userService: UserService) {
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
