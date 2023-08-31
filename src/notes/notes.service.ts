import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { NotesRepository } from './notes.repository';

@Injectable()
export class NotesService {
  constructor(private readonly repository: NotesRepository) {}

  async create(body: CreateNoteDto, user: User) {
    const { id: userId } = user;
    await this.findWithTitle(body, userId);
    return await this.repository.create(body, user);
  }

  findAll(user: User) {
    return this.repository.findAllFromUser(user);
  }

  async findOne(id: number, user: User) {
    const { id: userId } = user;
    const note = await this.repository.findOne(id);
    if (!note) throw new NotFoundException("Note doesn't exist.");
    if (note.userId !== userId) {
      throw new ForbiddenException("Note doesn't belong to user.");
    }

    return note;
  }

  async update(id: number, body: UpdateNoteDto, user: User) {
    const existingNote = await this.findOne(id, user);

    if (body.title !== undefined && body.title !== existingNote.title) {
      const { id: userId } = user;
      await this.findWithTitle(body as CreateNoteDto, userId);
    }

    return await this.repository.update(id, body, user);
  }

  async remove(id: number, user: User) {
    await this.findOne(id, user);
    await this.repository.remove(id, user);
    return;
  }

  private async findWithTitle(body: CreateNoteDto, userId: number) {
    const credential = await this.repository.findWithTitle(body, userId);
    if (credential) throw new ConflictException('Title already registered');
  }
}
