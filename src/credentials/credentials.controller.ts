import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UseGuards } from '@nestjs/common/decorators/core/use-guards.decorator';
import { ParseIntPipe } from '@nestjs/common/pipes/parse-int.pipe';
import { User as UserPrisma } from '@prisma/client';
import { User } from '../decorators/user.decorator';
import { AuthGuard } from '../guards/auth.guard';
import { CredentialsService } from './credentials.service';
import { CreateCredentialDto } from './dto/create-credential.dto';

@UseGuards(AuthGuard)
@Controller('credentials')
export class CredentialsController {
  constructor(private readonly credentialsService: CredentialsService) {}

  @Post()
  create(@Body() body: CreateCredentialDto, @User() user: UserPrisma) {
    return this.credentialsService.create(body, user);
  }

  @Get()
  findAll(@User() user: UserPrisma) {
    return this.credentialsService.findAll(user);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @User() user: UserPrisma) {
    return this.credentialsService.findOne(id, user);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number, @User() user: UserPrisma) {
    return this.credentialsService.remove(id, user);
  }
}
