import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const { authorization } = request.headers;

    try {
      if (!authorization) throw new Error();

      const jwt = this.authService.checkToken(
        (authorization ?? '').split(' ')[1],
      );
      const user = await this.usersService.findOneById(parseInt(jwt.sub));
      const verifyAccount = await this.usersService.findOneByEmail(jwt.email);
      if (!verifyAccount) throw new Error();

      request.user = user;
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid token.');
    }
  }
}
