import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from '../auth/auth.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const { authorization } = request.headers;

    try {
      const jwt = this.authService.checkToken(
        (authorization ?? '').split(' ')[1],
      );

      const user = await this.usersService.findOneById(parseInt(jwt.sub));
      if (!user) throw new Error();
      const verifyAccount = await this.usersService.findOneByEmail(jwt.email);
      if (!verifyAccount) throw new Error();

      response.locals.user = user;
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid token.');
    }
  }
}
