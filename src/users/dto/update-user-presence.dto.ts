import { IsBoolean, IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { UserStatus } from '../../common/types';

export class UpdateUserPresenceDto {
  @IsOptional()
  @IsIn(Object.values(UserStatus))
  status?: UserStatus;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  statusMessage?: string;

  @IsOptional()
  @IsBoolean()
  showOffline?: boolean;
}
