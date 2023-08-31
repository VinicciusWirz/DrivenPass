import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNoteDto } from './dto/create-note.dto';

@Injectable()
export class NotesRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(body: CreateNoteDto, user: User) {
    return this.prisma.note.create({
      data: {
        ...body,
        User: { connect: user },
      },
    });
  }

  findAllFromUser(user: User) {
    return this.prisma.note.findMany({ where: { User: user } });
  }

  findOne(id: number) {
    return this.prisma.note.findUnique({ where: { id } });
  }

  findWithTitle(body: CreateNoteDto, userId: number) {
    return this.prisma.note.findUnique({
      where: { title_userId: { title: body.title, userId: userId } },
    });
  }
}
