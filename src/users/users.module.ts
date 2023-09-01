import { Global, Module } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';

@Global()
@Module({
  controllers: [UsersController],
  providers: [UsersService, UsersRepository],
  exports: [UsersService],
})
export class UsersModule {}
