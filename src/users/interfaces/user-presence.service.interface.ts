import { UpdateUserPresenceParams } from '../../common/types';
import { UserPresence } from '../../common/entities/user-presence.entity';
import { User } from '../../common/entities/user.entity';

export const USER_PRESENCE_SERVICE_TOKEN = Symbol(
  'USER_PRESENCE_SERVICE_TOKEN',
);

export interface IUserPresenceService {
  getPresence(user: User): Promise<UserPresence>;

  createPresenceOrUpdate(
    user: User,
    params: UpdateUserPresenceParams,
  ): Promise<UserPresence>;
}
