export type FindUserParams = Partial<{
  id: string;
  email: string;
  username: string;
}>;

export type FindUserOptions = Partial<{
  selectAll: boolean;
}>;
