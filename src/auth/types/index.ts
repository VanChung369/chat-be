import { User } from 'src/users/entities/user.entity';
import type { Request } from 'express';

export type ValidateUserLogin = {
  email: string;
  password: string;
};

export interface AuthenticatedRequest extends Request {
  user: User;
}
