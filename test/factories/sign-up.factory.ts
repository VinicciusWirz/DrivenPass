import * as bcrypt from 'bcrypt';
import { faker } from '@faker-js/faker';
import { PrismaClient } from '@prisma/client';

export class SignUpFactory {
  private prisma: PrismaClient;
  private SALT = 10;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async createSignup(email?: string, password?: string) {
    const nonCryptedPassword =
      password ||
      faker.internet.password({
        length: 10,
        pattern: /[\w!@#$%^&*()_+{}\[\]:;<>,.?~\\-]/,
      });
    const hash = bcrypt.hashSync(nonCryptedPassword, this.SALT);
    const user = await this.prisma.user.create({
      data: {
        email: email || faker.internet.email(),
        password: hash,
      },
    });
    return { ...user, nonCryptedPassword };
  }
}
