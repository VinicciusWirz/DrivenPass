import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCredentialDto } from './dto/create-credential.dto';

@Injectable()
export class CredentialsRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(body: CreateCredentialDto, user: User) {
    return this.prisma.credential.create({
      data: {
        ...body,
        User: { connect: user },
      },
    });
  }

  findWithTitle(body: CreateCredentialDto, userId: number) {
    return this.prisma.credential.findUnique({
      where: { title_userId: { title: body.title, userId: userId } },
    });
  }

  findAllFromUser(user: User) {
    return this.prisma.credential.findMany({ where: { User: user } });
  }

  findOne(id: number) {
    return this.prisma.credential.findUnique({ where: { id } });
  }

  remove(id: number, user: User) {
    return this.prisma.credential.delete({ where: { id, User: user } });
  }
}
