import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';

export class ChangePasswordDto {
  @IsNotEmpty({ message: 'Current password is required' })
  @IsString()
  currentPassword!: string;

  @IsNotEmpty({ message: 'New password is required' })
  @IsString()
  @Length(8, 128, { message: 'Password must be between 8 and 128 characters' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>])/, {
    message: 'Password complexity requirements not met.',
  })
  newPassword!: string;
}
