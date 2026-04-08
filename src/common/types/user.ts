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

export type UpdateUserProfileParams = Partial<{
  about: string;
  avatarUrl: string;
  bannerUrl: string;
}>;

export type UpdateUserPresenceParams = Partial<{
  statusMessage: string;
  showOffline: boolean;
}>;

export type UserProfileFiles = Partial<
  Record<'avatar' | 'banner', UploadedFile[]>
>;
