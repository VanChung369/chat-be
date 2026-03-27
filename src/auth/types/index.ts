import type { Request } from 'express';
import { User } from '../../users/entities/user.entity';

export type ValidateUserLogin = {
  email: string;
  password: string;
};

export interface AuthenticatedRequest extends Request {
  user: User;
}
