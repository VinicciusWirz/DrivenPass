import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { User } from '@prisma/client';
import Cryptr from 'cryptr';
import { PrismaUtils } from '../utils/prisma.utils';
import { CardsRepository } from './cards.repository';
import { CreateCardDto } from './dto/create-card.dto';

@Injectable()
export class CardsService {
  private cryptr: Cryptr;

  constructor(
    private readonly repository: CardsRepository,
    private readonly config: ConfigService,
    private readonly prismaUtils: PrismaUtils,
  ) {
    const Cryptr = require('cryptr');
    this.cryptr = new Cryptr(this.config.get<string>('CRYPTR_SECRET'), {
      pbkdf2Iterations: 10000,
      saltLength: parseInt(this.config.get<string>('SALT')),
    });
  }

  async create(body: CreateCardDto, user: User) {
    const { id: userId } = user;
    await this.findWithTitle(body, userId);

    const { password, cvv } = body;
    body.password = this.cryptr.encrypt(password);
    body.cvv = this.cryptr.encrypt(cvv);

    const card = await this.repository.create(body, user);
    return this.prismaUtils.exclude(
      card,
      'createdAt',
      'updatedAt',
      'userId',
      'password',
      'cvv',
    );
  }

  async findAll(user: User) {
    const cards = await this.repository.findAllFromUser(user);

    return cards.map(({ password, cvv, ...card }) => {
      return {
        ...this.prismaUtils.exclude(card, 'createdAt', 'updatedAt', 'userId'),
        password: this.cryptr.decrypt(password),
        cvv: this.cryptr.decrypt(cvv),
      };
    });
  }

  async findOne(id: number, user: User) {
    const { id: userId } = user;
    const card = await this.repository.findOne(id);
    if (!card) throw new NotFoundException("Card doesn't exist.");
    if (card.userId !== userId) {
      throw new ForbiddenException("Card doesn't belong to user.");
    }

    card.password = this.cryptr.decrypt(card.password);
    card.cvv = this.cryptr.decrypt(card.cvv);
    return this.prismaUtils.exclude(card, 'createdAt', 'updatedAt', 'userId');
  }

  async remove(id: number, user: User) {
    await this.findOne(id, user);
    await this.repository.remove(id, user);
    return true;
  }

  private async findWithTitle(body: CreateCardDto, userId: number) {
    const card = await this.repository.findWithTitle(body, userId);
    if (card) throw new ConflictException('Title already registered');
  }
}
