import * as bcrypt from 'bcrypt';
import { faker } from '@faker-js/faker';
import { PrismaClient } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { SignUpDto } from '../../src/auth/dto/signUpDto';

export class AuthFactory {
  private prisma: PrismaClient;
  private readonly jwtService = new JwtService();
  private readonly SALT = parseInt(this.config.get<string>('SALT'));
  private readonly SECRET = this.config.get<string>('JWT_SECRET');
  private readonly EXPIRATION_TIME = '7 days';
  private readonly ISSUER = 'Driven';
  private readonly AUDIENCE = 'users';

  constructor(
    prisma: PrismaClient,
    private readonly config: ConfigService,
  ) {
    this.prisma = prisma;
  }

  generateDto(password?: string) {
    const dto = new SignUpDto();

    const nonCryptedPassword =
      password ||
      faker.internet.password({
        length: 10,
        pattern: /[\w!@#$%^&*()_+{}\[\]:;<>,.?~\\-]/,
      });

    dto.email = faker.internet.email();
    dto.password = nonCryptedPassword;
    return dto;
  }

  async createSignup(password?: string) {
    const dto = this.generateDto(password);

    const hash = bcrypt.hashSync(dto.password, this.SALT);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hash,
      },
    });
    return user;
  }

  async generateToken(email: string, userId: number) {
    const token = this.jwtService.sign(
      { email },
      {
        expiresIn: this.EXPIRATION_TIME,
        subject: String(userId),
        issuer: this.ISSUER,
        audience: this.AUDIENCE,
        secret: this.SECRET,
      },
    );
    return { token };
  }

  genFaketoken() {
    return { token: faker.lorem.slug({ min: 3, max: 6 }) };
  }
}
