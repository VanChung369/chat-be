import {
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateUserProfileDto {
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
}
