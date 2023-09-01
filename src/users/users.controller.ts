import {
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  UseGuards,
  Body,
  Get,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { User as UserPrisma } from '@prisma/client';
import { User } from '../decorators/user.decorator';
import { AuthGuard } from '../guards/auth.guard';
import { UserVerificationDto } from './dto/user-verification.dto';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('erase')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBody({ type: UserVerificationDto })
  @ApiOperation({ summary: "Delete all user's information" })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Password confirmation failed',
  })
  delete(@Body() body: UserVerificationDto, @User() user: UserPrisma) {
    return this.usersService.delete(body, user);
  }

  @Get('count')
  count(@User() user: UserPrisma) {
    return this.usersService.count(user);
  }
}
