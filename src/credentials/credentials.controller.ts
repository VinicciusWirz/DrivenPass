import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UseGuards } from '@nestjs/common/decorators/core/use-guards.decorator';
import { ParseIntPipe } from '@nestjs/common/pipes/parse-int.pipe';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { User as UserPrisma } from '@prisma/client';
import { User } from '../decorators/user.decorator';
import { AuthGuard } from '../guards/auth.guard';
import { CredentialsService } from './credentials.service';
import { CreateCredentialDto } from './dto/create-credential.dto';

@ApiTags('Credentials')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('credentials')
export class CredentialsController {
  constructor(private readonly credentialsService: CredentialsService) {}

  @Post()
  @ApiBody({ type: CreateCredentialDto })
  @ApiOperation({ summary: 'Register a credential' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Credential registered',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Title already registered',
  })
  create(@Body() body: CreateCredentialDto, @User() user: UserPrisma) {
    return this.credentialsService.create(body, user);
  }

  @Get()
  @ApiOperation({ summary: "List all user's credentials" })
  findAll(@User() user: UserPrisma) {
    return this.credentialsService.findAll(user);
  }

  @Get(':id')
  @ApiOperation({ summary: "Find one user's credential" })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: "Credential doesn't belong to user",
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Credential not found',
  })
  findOne(@Param('id', ParseIntPipe) id: number, @User() user: UserPrisma) {
    return this.credentialsService.findOne(id, user);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete user's credential" })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: "Credential doesn't belong to user",
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Credential not found',
  })
  remove(@Param('id', ParseIntPipe) id: number, @User() user: UserPrisma) {
    return this.credentialsService.remove(id, user);
  }
}
