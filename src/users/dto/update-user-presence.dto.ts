import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateUserPresenceDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  statusMessage?: string;

  @IsOptional()
  @IsBoolean()
  showOffline?: boolean;
}
