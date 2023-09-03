import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaUtils } from '../utils/prisma.utils';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { NotesRepository } from './notes.repository';

@Injectable()
export class NotesService {
  constructor(
    private readonly repository: NotesRepository,
    private readonly prismaUtils: PrismaUtils,
  ) {}

  async create(body: CreateNoteDto, user: User) {
    const { id: userId } = user;
    await this.findWithTitle(body, userId);
    const note = await this.repository.create(body, user);
    return this.prismaUtils.exclude(note, 'createdAt', 'updatedAt', 'userId');
  }

  async findAll(user: User) {
    const notes = await this.repository.findAllFromUser(user);
    return notes.map((note) =>
      this.prismaUtils.exclude(note, 'createdAt', 'updatedAt', 'userId'),
    );
  }

  async findOne(id: number, user: User) {
    const { id: userId } = user;
    const note = await this.repository.findOne(id);
    if (!note) throw new NotFoundException("Note doesn't exist.");
    if (note.userId !== userId) {
      throw new ForbiddenException("Note doesn't belong to user.");
    }

    return this.prismaUtils.exclude(note, 'createdAt', 'updatedAt', 'userId');
  }

  async update(id: number, body: UpdateNoteDto, user: User) {
    const existingNote = await this.findOne(id, user);

    if (body.title !== undefined && body.title !== existingNote.title) {
      const { id: userId } = user;
      await this.findWithTitle(body as CreateNoteDto, userId);
    }

    const updatedNote = await this.repository.update(id, body, user);
    return this.prismaUtils.exclude(updatedNote, 'createdAt', 'updatedAt', 'userId')
  }

  async remove(id: number, user: User) {
    await this.findOne(id, user);
    await this.repository.remove(id, user);
    return true;
  }

  private async findWithTitle(body: CreateNoteDto, userId: number) {
    const note = await this.repository.findWithTitle(body, userId);
    if (note) throw new ConflictException('Title already registered');
  }
}
