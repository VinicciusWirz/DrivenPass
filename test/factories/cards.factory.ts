import { faker } from '@faker-js/faker';
import { CardType, PrismaClient, User } from '@prisma/client';
import { CreateCardDto } from '../../src/cards/dto/create-card.dto';
import { Helper } from '../helpers/helper';

export class CardsFactory {
  private prisma: PrismaClient;

  constructor(
    prisma: PrismaClient,
    private readonly helper: Helper,
  ) {
    this.prisma = prisma;
  }

  generateDto() {
    const fakeMonth = faker.number.int({ min: 1, max: 12 });
    const fakeYear = faker.number.int({ min: 0, max: 99 });
    const typeOpt = [CardType.BOTH, CardType.CREDIT, CardType.DEBIT];
    const randomIndex = Math.floor(Math.random() * typeOpt.length);
    const type = typeOpt[randomIndex];

    const dto = new CreateCardDto();
    dto.cvv = faker.finance.creditCardCVV();
    dto.expiration = this.helper.formatExpDate(fakeMonth, fakeYear);
    dto.name = faker.finance.accountName();
    dto.number = faker.finance.creditCardNumber();
    dto.password = faker.finance.pin();
    dto.title = faker.lorem.words();
    dto.type = type;
    dto.virtual = faker.datatype.boolean();
    return dto;
  }

  async registerCard(user: User, dto?: CreateCardDto) {
    const body = dto || this.generateDto();
    const deploy = { ...body };
    deploy.cvv = this.helper.encryptData(deploy.cvv);
    deploy.password = this.helper.encryptData(deploy.password);

    const deployed = await this.prisma.card.create({
      data: { ...deploy, User: { connect: user } },
    });

    return { body, deployed };
  }
}
