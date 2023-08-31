import { createParamDecorator, SetMetadata } from '@nestjs/common';
import { UnauthorizedException } from '@nestjs/common/exceptions';
import { ExecutionContext } from '@nestjs/common/interfaces';
import { Response } from 'express';

export const User = createParamDecorator(
  (data: string, context: ExecutionContext) => {
    const response = context.switchToHttp().getResponse<Response>();
    if (!response.locals.user)
      throw new UnauthorizedException('User not Found.');

    return response.locals.user;
  },
);
