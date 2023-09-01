import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCardDto } from './dto/create-card.dto';

@Injectable()
export class CardsRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(body: CreateCardDto, user: User) {
    return this.prisma.card.create({
      data: {
        ...body,
        User: { connect: user },
      },
    });
  }

  findAllFromUser(user: User) {
    return this.prisma.card.findMany({ where: { User: user } });
  }

  findOne(id: number) {
    return this.prisma.card.findUnique({ where: { id } });
  }

  findWithTitle(body: CreateCardDto, userId: number) {
    return this.prisma.card.findUnique({
      where: { title_userId: { title: body.title, userId: userId } },
    });
  }
}
