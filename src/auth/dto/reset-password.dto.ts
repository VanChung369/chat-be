import { IsEmail, IsNotEmpty, Length, Matches } from 'class-validator';

/**
 * DTO for the Reset Password request.
 */
export class ResetPasswordDto {
  @IsEmail({}, { message: 'Invalid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsNotEmpty({ message: 'Reset code is required' })
  @Length(6, 6, { message: 'Reset code must be 6 characters' })
  code: string;

  @IsNotEmpty({ message: 'New password is required' })
  @Length(6, 128, { message: 'Password must be between 6 and 128 characters' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>])/, {
    message: 'Password complexity requirements not met.',
  })
  newPassword: string;
}
