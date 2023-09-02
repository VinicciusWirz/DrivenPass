import { faker } from '@faker-js/faker';
import { PrismaClient, User } from '@prisma/client';
import { CreateLicenseDto } from '../../src/licenses/dto/create-license.dto';

export class LicensesFactory {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  generateDto() {
    const dto = new CreateLicenseDto();

    dto.licenseKey = faker.lorem.slug({ min: 3, max: 5 });
    dto.softwareName = faker.commerce.productName();
    dto.softwareVersion = faker.company.buzzNoun();
    return dto;
  }

  async registerLicense(user: User, dto?: CreateLicenseDto) {
    const body = dto || this.generateDto();

    const deployed = await this.prisma.license.create({
      data: { ...body, User: { connect: user } },
    });

    return { body, deployed };
  }
}
