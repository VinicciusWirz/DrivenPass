import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { User } from '@prisma/client';
import Cryptr from 'cryptr';
import { CardsRepository } from './cards.repository';
import { CreateCardDto } from './dto/create-card.dto';

@Injectable()
export class CardsService {
  private cryptr: Cryptr;

  constructor(private readonly repository: CardsRepository) {
    const Cryptr = require('cryptr');
    this.cryptr = new Cryptr(process.env.CRYPTR_SECRET, {
      pbkdf2Iterations: 10000,
      saltLength: 10,
    });
  }

  async create(body: CreateCardDto, user: User) {
    const { id: userId } = user;
    await this.findWithTitle(body, userId);

    const { password, cvv } = body;
    body.password = this.cryptr.encrypt(password);
    body.cvv = this.cryptr.encrypt(cvv);

    return await this.repository.create(body, user);
  }

  async findAll(user: User) {
    const cards = await this.repository.findAllFromUser(user);

    return cards.map(({ password, cvv, ...card }) => {
      return {
        ...card,
        password: this.cryptr.decrypt(password),
        cvv: this.cryptr.decrypt(cvv),
      };
    });
  }

  async findOne(id: number, user: User) {
    const { id: userId } = user;
    const credential = await this.repository.findOne(id);
    if (!credential) throw new NotFoundException("Card doesn't exist.");
    if (credential.userId !== userId) {
      throw new ForbiddenException("Card doesn't belong to user.");
    }

    credential.password = this.cryptr.decrypt(credential.password);
    credential.cvv = this.cryptr.decrypt(credential.cvv);
    return credential;
  }

  remove(id: number) {
    return `This action removes a #${id} card`;
  }

  private async findWithTitle(body: CreateCardDto, userId: number) {
    const credential = await this.repository.findWithTitle(body, userId);
    if (credential) throw new ConflictException('Title already registered');
  }
}
