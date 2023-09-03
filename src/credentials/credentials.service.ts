import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import Cryptr from 'cryptr';
import { User } from '@prisma/client';
import { CredentialsRepository } from './credentials.repository';
import { CreateCredentialDto } from './dto/create-credential.dto';
import { ConfigService } from '@nestjs/config';
import { PrismaUtils } from '../utils/prisma.utils';

@Injectable()
export class CredentialsService {
  private cryptr: Cryptr;

  constructor(
    private readonly repository: CredentialsRepository,
    private readonly config: ConfigService,
    private readonly prismaUtils: PrismaUtils,
  ) {
    const Cryptr = require('cryptr');
    this.cryptr = new Cryptr(this.config.get<string>('CRYPTR_SECRET'), {
      pbkdf2Iterations: 10000,
      saltLength: parseInt(this.config.get<string>('SALT')),
    });
  }

  async create(body: CreateCredentialDto, user: User) {
    await this.findWithTitle(body, user.id);
    body.password = this.cryptr.encrypt(body.password);
    const credential = await this.repository.create(body, user);
    return this.prismaUtils.exclude(
      credential,
      'createdAt',
      'updatedAt',
      'password',
      'userId',
    );
  }

  async findAll(user: User) {
    const credentials = await this.repository.findAllFromUser(user);

    return credentials.map(({ password, ...credential }) => {
      return {
        ...this.prismaUtils.exclude(
          credential,
          'createdAt',
          'updatedAt',
          'userId',
        ),
        password: this.cryptr.decrypt(password),
      };
    });
  }

  async findOne(id: number, user: User) {
    const { id: userId } = user;
    const credential = await this.repository.findOne(id);
    if (!credential) throw new NotFoundException("Credential doesn't exist.");
    if (credential.userId !== userId) {
      throw new ForbiddenException("Credential doesn't belong to user.");
    }

    return {
      ...this.prismaUtils.exclude(
        credential,
        'createdAt',
        'updatedAt',
        'userId',
      ),
      password: this.cryptr.decrypt(credential.password),
    };
  }

  async remove(id: number, user: User) {
    await this.findOne(id, user);
    await this.repository.remove(id, user);
    return true;
  }

  private async findWithTitle(body: CreateCredentialDto, userId: number) {
    const credential = await this.repository.findWithTitle(body, userId);
    if (credential) throw new ConflictException('Title already registered');
  }
}
