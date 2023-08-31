import * as bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SignUpDto } from '../auth/dto/signUpDto';

@Injectable()
export class UsersRepository {
  private SALT = 10;

  constructor(private readonly prisma: PrismaService) {}

  getById(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  findOneByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  create(signUpDto: SignUpDto) {
    const { email, password } = signUpDto;
    return this.prisma.user.create({
      data: {
        email,
        password: bcrypt.hashSync(password, this.SALT),
      },
    });
  }
}
