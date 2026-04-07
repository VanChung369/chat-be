import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ConfirmTempUploadDto {
  @IsString()
  @IsNotEmpty()
  tempId!: string;

  @IsString()
  @IsNotEmpty()
  folder!: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  fileName?: string;
}
