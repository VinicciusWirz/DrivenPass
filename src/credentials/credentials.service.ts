import { ConflictException, Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { CredentialsRepository } from './credentials.repository';
import { CreateCredentialDto } from './dto/create-credential.dto';

@Injectable()
export class CredentialsService {
  constructor(private readonly repository: CredentialsRepository) {}

  async create(body: CreateCredentialDto, user: User) {
    await this.findWithTitle(body, user.id);
    return await this.repository.create(body, user);
  }

  findAll(user: User) {
    return `This action returns all credentials`;
  }

  findOne(id: number, user: User) {
    return `This action returns a #${id} credential`;
  }

  remove(id: number, user: User) {
    return `This action removes a #${id} credential`;
  }

  async findWithTitle(body: CreateCredentialDto, userId: number) {
    const credential = await this.repository.findWithTitle(body, userId);
    if (credential) throw new ConflictException('Title already registered');
  }
}
