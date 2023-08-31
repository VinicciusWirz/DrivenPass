import { ConflictException, Injectable } from '@nestjs/common';
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

  findAll() {
    return `This action returns all notes`;
  }

  findOne(id: number) {
    return `This action returns a #${id} note`;
  }

  update(id: number, body: UpdateNoteDto) {
    return `This action updates a #${id} note`;
  }

  remove(id: number) {
    return `This action removes a #${id} note`;
  }

  private async findWithTitle(body: CreateNoteDto, userId: number) {
    const credential = await this.repository.findWithTitle(body, userId);
    if (credential) throw new ConflictException('Title already registered');
  }
}
