export type UploadedFile = {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
};

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
  avatar: UploadedFile;
  banner: UploadedFile;
}>;

export type UserProfileFiles = Partial<
  Record<'avatar' | 'banner', UploadedFile[]>
>;
