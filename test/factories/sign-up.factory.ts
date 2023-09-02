import * as bcrypt from 'bcrypt';
import { faker } from '@faker-js/faker';
import { PrismaClient } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

export class SignUpFactory {
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

  async createSignup(password?: string) {
    const nonCryptedPassword =
      password ||
      faker.internet.password({
        length: 10,
        pattern: /[\w!@#$%^&*()_+{}\[\]:;<>,.?~\\-]/,
      });
    const hash = bcrypt.hashSync(nonCryptedPassword, this.SALT);

    const user = await this.prisma.user.create({
      data: {
        email: faker.internet.email(),
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
