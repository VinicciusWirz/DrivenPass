import { PrismaClient, User } from '@prisma/client';
import { CardsFactory } from './cards.factory';
import { CredentialsFactory } from './credentials.factory';
import { LicensesFactory } from './licenses.factory';
import { NotesFactory } from './notes.factory';
import { WifisFactory } from './wifis.factory';

export class UsersFactory {
  constructor(
    private prisma: PrismaClient,
    private cardsFactory: CardsFactory,
    private credentialsFactory: CredentialsFactory,
    private licensesFactory: LicensesFactory,
    private wifisFactory: WifisFactory,
    private notesFactory: NotesFactory,
  ) {}

  async populateUserAccount(user: User) {
    const amounts = {
      Note: Math.ceil(Math.random() * 10),
      Card: Math.ceil(Math.random() * 10),
      Credential: Math.ceil(Math.random() * 10),
      License: Math.ceil(Math.random() * 10),
      Wifi: Math.ceil(Math.random() * 10),
    };
    for (let i = 0; i < amounts.Note; i++) {
      await this.notesFactory.registerNote(user);
    }
    for (let i = 0; i < amounts.Card; i++) {
      await this.cardsFactory.registerCard(user);
    }
    for (let i = 0; i < amounts.License; i++) {
      await this.licensesFactory.registerLicense(user);
    }
    for (let i = 0; i < amounts.Credential; i++) {
      await this.credentialsFactory.registerCredential(user);
    }
    for (let i = 0; i < amounts.Wifi; i++) {
      await this.wifisFactory.registerWifi(user);
    }

    const { _count: count } = await this.prisma.user.findUnique({
      where: { id: user.id },
      select: {
        _count: true,
      },
    });
    return { amounts, count };
  }

  async findUser(userId: number) {
    return await this.prisma.user.findUnique({ where: { id: userId } });
  }

  async countUserData(user: User) {
    const cards = await this.prisma.card.findMany({ where: { User: user } });
    const notes = await this.prisma.note.findMany({ where: { User: user } });
    const credentials = await this.prisma.credential.findMany({
      where: { User: user },
    });
    const wifis = await this.prisma.wifi.findMany({ where: { User: user } });
    const licenses = await this.prisma.license.findMany({
      where: { User: user },
    });

    return { cards, notes, credentials, wifis, licenses };
  }
}
