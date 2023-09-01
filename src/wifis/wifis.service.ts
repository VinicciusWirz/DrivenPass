import { Injectable } from '@nestjs/common';
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

  findOne(id: number) {
    return `This action returns a #${id} wifi`;
  }

  remove(id: number) {
    return `This action removes a #${id} wifi`;
  }
}
