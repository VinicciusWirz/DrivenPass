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
import { PasswordConfirmationDto } from './dto/password-confirmation.dto';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('erase')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBody({ type: PasswordConfirmationDto })
  @ApiOperation({ summary: "Delete all user's information" })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Password confirmation failed',
  })
  delete(@Body() body: PasswordConfirmationDto, @User() user: UserPrisma) {
    return this.usersService.delete(body, user);
  }

  @Get('count')
  @ApiOperation({ summary: "Counts user's registrations" })
  count(@User() user: UserPrisma) {
    return this.usersService.count(user);
  }
}
