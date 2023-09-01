import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/signInDto';
import { SignUpDto } from './dto/signUpDto';

@ApiTags('Authorization')
@Controller('users/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sign-up')
  @HttpCode(HttpStatus.CREATED)
  @ApiBody({ type: SignUpDto })
  @ApiOperation({ summary: 'Register an user' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'User registered.' })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'User already registered.',
  })
  signUp(@Body() signUpDto: SignUpDto) {
    return this.authService.signUp(signUpDto);
  }

  @Post('sign-in')
  @HttpCode(HttpStatus.OK)
  @ApiBody({ type: SignInDto })
  @ApiOperation({ summary: 'Authenticate an user' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Generates user token.' })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Email or password not valid.',
  })
  signIn(@Body() signInDto: SignInDto) {
    return this.authService.signIn(signInDto);
  }
}
