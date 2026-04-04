import { UpdateUserPresenceParams } from '../../common/utils/types';
import { UserPresence } from '../../common/entities/user-presence.entity';
import { User } from '../../common/entities/user.entity';

export interface IUserPresenceService {
  getPresence(user: User): Promise<UserPresence>;

  createPresenceOrUpdate(
    user: User,
    params: UpdateUserPresenceParams,
  ): Promise<UserPresence>;
}
