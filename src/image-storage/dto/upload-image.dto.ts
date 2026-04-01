import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class UploadImageDto {
  @IsString()
  @IsNotEmpty()
  fileName: string;

  @IsString()
  @IsOptional()
  folder?: string;
}
