import { IsEmail, IsNotEmpty } from 'class-validator';

/**
 * DTO for the Forgot Password request.
 */
export class ForgotPasswordDto {
  @IsEmail({}, { message: 'Invalid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email!: string;
}
