import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { User } from '@prisma/client';
import Cryptr from 'cryptr';
import { PrismaUtils } from '../utils/prisma.utils';
import { CreateWifiDto } from './dto/create-wifi.dto';
import { WifisRepository } from './wifis.repository';

@Injectable()
export class WifisService {
  private cryptr: Cryptr;

  constructor(
    private readonly repository: WifisRepository,
    private readonly config: ConfigService,
    private readonly prismaUtils: PrismaUtils,
  ) {
    const Cryptr = require('cryptr');
    this.cryptr = new Cryptr(this.config.get<string>('CRYPTR_SECRET'), {
      pbkdf2Iterations: 10000,
      saltLength: parseInt(this.config.get<string>('SALT')),
    });
  }

  async create(body: CreateWifiDto, user: User) {
    body.password = this.cryptr.encrypt(body.password);

    const wifi = await this.repository.create(body, user);
    return this.prismaUtils.exclude(
      wifi,
      'createdAt',
      'updatedAt',
      'password',
      'userId',
    );
  }

  async findAll(user: User) {
    const wifis = await this.repository.findAllFromUser(user);
    return wifis.map(({ password, ...wifi }) => {
      return {
        ...this.prismaUtils.exclude(wifi, 'createdAt', 'updatedAt', 'userId'),
        password: this.cryptr.decrypt(password),
      };
    });
  }

  async findOne(id: number, user: User) {
    const { id: userId } = user;
    const wifi = await this.repository.findOne(id);
    if (!wifi) throw new NotFoundException("Wifi register doesn't exist.");
    if (wifi.userId !== userId) {
      throw new ForbiddenException("Wifi register doesn't belong to user.");
    }

    return {
      ...this.prismaUtils.exclude(wifi, 'createdAt', 'updatedAt', 'userId'),
      password: this.cryptr.decrypt(wifi.password),
    };
  }

  async remove(id: number, user: User) {
    await this.findOne(id, user);
    await this.repository.remove(id, user);
    return true;
  }
}
