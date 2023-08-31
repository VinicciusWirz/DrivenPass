import { createParamDecorator, SetMetadata } from '@nestjs/common';
import { UnauthorizedException } from '@nestjs/common/exceptions';
import { ExecutionContext } from '@nestjs/common/interfaces';

export const User = createParamDecorator(
  (data: string, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    if (!request.user) throw new UnauthorizedException('User not Found.');

    return request.user;
  },
);
