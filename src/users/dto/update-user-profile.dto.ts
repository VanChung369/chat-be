import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateUserProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(240)
  about?: string;
}
