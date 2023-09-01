import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { User } from '@prisma/client';
import Cryptr from 'cryptr';
import { CreateWifiDto } from './dto/create-wifi.dto';
import { WifisRepository } from './wifis.repository';

@Injectable()
export class WifisService {
  private cryptr: Cryptr;

  constructor(private readonly repository: WifisRepository) {
    const Cryptr = require('cryptr');
    this.cryptr = new Cryptr(process.env.CRYPTR_SECRET, {
      pbkdf2Iterations: 10000,
      saltLength: 10,
    });
  }

  async create(body: CreateWifiDto, user: User) {
    body.password = this.cryptr.encrypt(body.password);

    return await this.repository.create(body, user);
  }

  async findAll(user: User) {
    return await this.repository.findAllFromUser(user);
  }

  async findOne(id: number, user: User) {
    const { id: userId } = user;
    const wifi = await this.repository.findOne(id);
    if (!wifi) throw new NotFoundException("Wifi register doesn't exist.");
    if (wifi.userId !== userId) {
      throw new ForbiddenException("Wifi register doesn't belong to user.");
    }

    return {
      ...wifi,
      password: this.cryptr.decrypt(wifi.password),
    };
  }

  remove(id: number) {
    return `This action removes a #${id} wifi`;
  }
}
