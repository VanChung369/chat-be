import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  private readonly logger = new Logger(LocalAuthGuard.name);

  async canActivate(context: ExecutionContext) {
    this.logger.log('Checking if user is authenticated', LocalAuthGuard.name);
    const request = context.switchToHttp().getRequest();

    const result = (await super.canActivate(context)) as boolean;

    await super.logIn(request);

    return result;
  }
}

@Injectable()
export class AuthenticatedGuard implements CanActivate {
  private readonly logger = new Logger(AuthenticatedGuard.name);

  async canActivate(context: ExecutionContext) {
    this.logger.log(
      'Checking if user is authenticated',
      AuthenticatedGuard.name,
    );

    const req = context.switchToHttp().getRequest();
    const authenticated = req.isAuthenticated();
    return authenticated;
  }
}
