import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateCurrentUserDto {
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
}
