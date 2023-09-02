import { faker } from '@faker-js/faker';
import { PrismaClient, User } from '@prisma/client';
import { CreateNoteDto } from '../../src/notes/dto/create-note.dto';

export class NotesFactory {
  private prisma: PrismaClient;

  constructor(
    prisma: PrismaClient,
  ) {
    this.prisma = prisma;
  }

  generateDto() {
    const dto = new CreateNoteDto();

    dto.title = faker.lorem.words();
    dto.text = faker.lorem.text();
    return dto;
  }

  async registerNote(user: User, dto?: CreateNoteDto) {
    const body = dto || this.generateDto();
    const deploy = { ...body };

    const deployed = await this.prisma.note.create({
      data: { ...deploy, User: { connect: user } },
    });

    return { body, deployed };
  }
}
