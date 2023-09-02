import { ConfigService } from '@nestjs/config/dist';
import { PrismaClient } from '@prisma/client';
import Cryptr from 'cryptr';

export class Helper {
  private prisma: PrismaClient;
  private cryptr: Cryptr;
  private readonly SALT = parseInt(this.config.get<string>('SALT'));

  constructor(
    prisma: PrismaClient,
    private readonly config: ConfigService,
  ) {
    this.prisma = prisma;
    const Cryptr = require('cryptr');
    this.cryptr = new Cryptr(this.config.get<string>('CRYPTR_SECRET'), {
      pbkdf2Iterations: 10000,
      saltLength: this.SALT,
    });
  }

  async cleanDB() {
    await this.prisma.user.deleteMany();
  }

  encryptData(data: string) {
    return this.cryptr.encrypt(data);
  }

  decryptData(data: string) {
    return this.cryptr.decrypt(data);
  }

  formatExpDate(month: number, year: number) {
    const monthFormat = month < 10 ? `0${month}` : `${month}`;
    const yearFormat = year < 10 ? `0${year}` : `${year}`;
    return `${monthFormat}/${yearFormat}`;
  }
}
