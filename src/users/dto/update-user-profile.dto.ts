import {
  IsBoolean,
  IsIn,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
} from 'class-validator';
import { UserStatus } from '../../common/types';

export class UpdateUserProfileDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(16)
  username?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(32)
  firstName?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(32)
  lastName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(240)
  about?: string;

  @IsOptional()
  @IsString()
  @MinLength(7)
  @MaxLength(15)
  phone?: string;

  @IsOptional()
  @IsUrl()
  avatarUrl?: string;

  @IsOptional()
  @IsUrl()
  bannerUrl?: string;

  @IsOptional()
  @IsIn(Object.values(UserStatus))
  status?: UserStatus;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  statusMessage?: string;

  @IsOptional()
  @IsBoolean()
  showOnlineStatus?: boolean;
}
