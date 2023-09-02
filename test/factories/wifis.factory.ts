import { faker } from '@faker-js/faker';
import { PrismaClient, User } from '@prisma/client';
import { CreateWifiDto } from '../../src/wifis/dto/create-wifi.dto';
import { Helper } from '../helpers/helper';

export class WifisFactory {
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
    const dto = new CreateWifiDto();

    dto.title = faker.lorem.words();
    dto.name = faker.internet.userName();
    dto.password = faker.internet.password(passwordOptions);
    return dto;
  }

  async registerWifi(user: User, dto?: CreateWifiDto) {
    const body = dto || this.generateDto();
    const deploy = { ...body };
    deploy.password = this.helper.encryptData(deploy.password);

    const deployed = await this.prisma.wifi.create({
      data: { ...deploy, User: { connect: user } },
    });

    return { body, deployed };
  }
}
