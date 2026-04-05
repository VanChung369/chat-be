import { Inject, Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AUTH_SERVICE_TOKEN } from '../interfaces/auth.service.interface';
import type { IAuthService } from '../interfaces/auth.service.interface';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(LocalStrategy.name);

  constructor(
    @Inject(AUTH_SERVICE_TOKEN)
    private readonly authService: IAuthService,
  ) {
    super({ usernameField: 'email' });
  }

  async validate(email: string, password: string) {
    this.logger.log(`Validation credentials for email: ${email}`);
    const user = await this.authService.validateUser({
      email,
      password,
    });

    return user;
  }
}


