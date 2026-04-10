import { UploadedFile } from './upload';

export type FindUserParams = Partial<{
  id: string;
  email: string;
  username: string;
  isVerified?: boolean;
}>;

export type FindUserOptions = Partial<{
  selectAll: boolean;
}>;

export enum UserStatus {
  Online = 'online',
  Away = 'away',
  Busy = 'busy',
}

export type UpdateCurrentUserParams = Partial<{
  username: string;
  firstName: string;
  lastName: string;
  about: string;
  phone: string;
  avatarUrl: string;
  bannerUrl: string;
  status: UserStatus;
  statusMessage: string;
  showOnlineStatus: boolean;
}>;

export type UpdateUserProfileParams = UpdateCurrentUserParams;

export type UpdateUserPresenceParams = Partial<{
  status: UserStatus;
  statusMessage: string;
  showOffline: boolean;
}>;

export type UserProfileFiles = Partial<
  Record<'avatar' | 'banner', UploadedFile[]>
>;
