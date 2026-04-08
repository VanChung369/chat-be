import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class UploadImageDto {
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  fileName?: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  folder?: string;
}
