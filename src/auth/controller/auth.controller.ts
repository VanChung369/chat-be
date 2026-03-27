import {
  Body,
  Controller,
  HttpStatus,
  Logger,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from '../service/auth.service';
import { RegisterDto } from '../dto/register.dto';
import { AuthenticatedGuard, LocalAuthGuard } from '../guards/access.guard';
import type { Response } from 'express';
import type { AuthenticatedRequest } from '../types';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

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
    return res.send(HttpStatus.OK);
  }

  @Post('logout')
  @UseGuards(AuthenticatedGuard)
  logout(@Req() req: AuthenticatedRequest, @Res() res: Response) {
    this.logger.log('Logout route called');
    return req.logout(() => {
      return res.send(HttpStatus.OK);
    });
  }
}
