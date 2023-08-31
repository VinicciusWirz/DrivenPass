import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import Cryptr from 'cryptr';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCredentialDto } from './dto/create-credential.dto';

@Injectable()
export class CredentialsRepository {
  private cryptr: Cryptr;
  constructor(private readonly prisma: PrismaService) {
    const Cryptr = require('cryptr');
    this.cryptr = new Cryptr(process.env.CRYPTR_SECRET, {
      pbkdf2Iterations: 10000,
      saltLength: 10,
    });
  }

  create(body: CreateCredentialDto, user: User) {
    const { password } = body;
    return this.prisma.credential.create({
      data: {
        ...body,
        password: this.cryptr.encrypt(password),
        User: { connect: user },
      },
    });
  }

  findWithTitle(body: CreateCredentialDto, userId: number) {
    return this.prisma.credential.findUnique({
      where: { title_userId: { title: body.title, userId: userId } },
    });
  }
}
