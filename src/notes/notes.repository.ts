import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';

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

  remove(id: number, user: User) {
    return this.prisma.note.delete({ where: { id, User: user } });
  }

  update(id: number, body: UpdateNoteDto, user: User) {
    return this.prisma.note.update({
      data: body,
      where: { id, User: user },
    });
  }

  findWithTitle(body: CreateNoteDto, userId: number) {
    return this.prisma.note.findUnique({
      where: { title_userId: { title: body.title, userId: userId } },
    });
  }
}
