import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(16)
  username: string;

  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(32)
  firstName: string;

  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(32)
  lastName: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @Length(6, 128, { message: 'Password must be between 6 and 128 characters' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>])/, {
    message: 'Password complexity requirements not met.',
  })
  password: string;
}
