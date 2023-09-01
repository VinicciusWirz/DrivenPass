import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { SignInDto } from './dto/signInDto';
import { SignUpDto } from './dto/signUpDto';

@Injectable()
export class AuthService {
  private EXPIRATION_TIME = '7 days';
  private ISSUER = 'Driven';
  private AUDIENCE = 'users';

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async signUp(signUpDto: SignUpDto) {
    const { email } = signUpDto;
    const user = await this.usersService.findOneByEmail(email);
    if (user) throw new ConflictException();

    await this.usersService.create(signUpDto);
    return { message: 'User created.' };
  }

  async signIn(signInDto: SignInDto) {
    const { email, password } = signInDto;
    const user = await this.usersService.findOneByEmail(email);
    if (!user) throw new UnauthorizedException(`Email or password not valid.`);

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new UnauthorizedException(`Email or password not valid.`);

    return this.generateToken(user);
  }

  checkToken(token: string) {
    const data = this.jwtService.verify(token, {
      audience: this.AUDIENCE,
      issuer: this.ISSUER,
    });
    return data;
  }

  private generateToken(user: User) {
    const { email, id } = user;
    const token = this.jwtService.sign(
      { email },
      {
        expiresIn: this.EXPIRATION_TIME,
        subject: String(id),
        issuer: this.ISSUER,
        audience: this.AUDIENCE,
      },
    );
    return { token };
  }
}
