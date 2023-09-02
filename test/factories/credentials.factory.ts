import { faker } from '@faker-js/faker';
import { PrismaClient, User } from '@prisma/client';
import { CreateCredentialDto } from '../../src/credentials/dto/create-credential.dto';
import { Helper } from '../helpers/helper';

export class CredentialsFactory {
  private prisma: PrismaClient;

  constructor(
    prisma: PrismaClient,
    private readonly helper: Helper,
  ) {
    this.prisma = prisma;
  }

  generateDto() {
    const passwordOptions = {
      length: 10,
      pattern: /[\w!@#$%^&*()_+{}\[\]:;<>,.?~\\-]/,
    };
    const dto = new CreateCredentialDto();

    dto.password = faker.internet.password(passwordOptions);
    dto.title = faker.lorem.words();
    dto.url = faker.internet.url();
    dto.username = faker.internet.userName();
    return dto;
  }

  async registerCredential(user: User, dto?: CreateCredentialDto) {
    const body = dto || this.generateDto();
    const deploy = { ...body };
    deploy.password = this.helper.encryptData(deploy.password);

    const deployed = await this.prisma.credential.create({
      data: { ...deploy, User: { connect: user } },
    });

    return { body, deployed };
  }
}
