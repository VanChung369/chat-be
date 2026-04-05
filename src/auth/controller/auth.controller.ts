import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Inject,
  InternalServerErrorException,
  Logger,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AUTH_SERVICE_TOKEN } from '../interfaces/auth.service.interface';
import type { IAuthService } from '../interfaces/auth.service.interface';
import { RegisterDto } from '../dto/register.dto';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { AuthenticatedGuard, LocalAuthGuard } from '../guards/access.guard';
import type { Response } from 'express';
import type { AuthenticatedRequest } from '../types';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    @Inject(AUTH_SERVICE_TOKEN)
    private readonly authService: IAuthService,
  ) {}

  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    this.logger.log(
      `Incoming register request for email: ${registerDto.email}`,
    );
    return this.authService.register(registerDto);
  }

  @Post('login')
  @UseGuards(LocalAuthGuard)
  login(@Res() res: Response) {
    this.logger.log('Login route completed with LocalAuthGuard');
    return res.status(HttpStatus.OK).json({ message: 'Login successful' });
  }

  @Post('logout')
  @UseGuards(AuthenticatedGuard)
  logout(@Req() req: AuthenticatedRequest, @Res() res: Response) {
    this.logger.log('Logout route called');
    return req.logout((error) => {
      if (error) {
        throw new InternalServerErrorException('Logout failed');
      }
      return res.status(HttpStatus.OK).json({ message: 'Logout successful' });
    });
  }

  @Post('forgot-password')
  async forgotPassword(
    @Body() forgotPasswordDto: ForgotPasswordDto,
    @Res() res: Response,
  ) {
    this.logger.log(
      `Forgot password request for email: ${forgotPasswordDto.email}`,
    );
    await this.authService.forgotPassword(forgotPasswordDto.email);
    return res
      .status(HttpStatus.OK)
      .json({ message: 'Reset password code sent to your email' });
  }

  @Post('reset-password')
  async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
    @Res() res: Response,
  ) {
    this.logger.log(
      `Reset password attempt for email: ${resetPasswordDto.email}`,
    );
    await this.authService.resetPassword(
      resetPasswordDto.email,
      resetPasswordDto.code,
      resetPasswordDto.newPassword,
    );
    return res
      .status(HttpStatus.OK)
      .json({ message: 'Password reset successfully' });
  }

  @Post('verify')
  async verifyEmail(
    @Body() body: { email: string; code: string },
    @Res() res: Response,
  ) {
    const isValid = await this.authService.verifyEmail(body.email, body.code);
    if (!isValid) {
      throw new HttpException(
        'Token is invalid or expired',
        HttpStatus.BAD_REQUEST,
      );
    }
    return res
      .status(HttpStatus.OK)
      .json({ message: 'Email verified successfully' });
  }

  @Post('resend-code')
  async resendCode(@Body('email') email: string, @Res() res: Response) {
    await this.authService.resendVerificationCode(email);
    return res
      .status(HttpStatus.OK)
      .json({ message: 'Resend verification code successfully' });
  }
}


