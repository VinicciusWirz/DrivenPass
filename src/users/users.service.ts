import { Injectable } from '@nestjs/common';
import { SignUpDto } from '../auth/dto/signUpDto';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async create(signUpDto: SignUpDto) {
    return await this.usersRepository.create(signUpDto);
  }

  async findOneByEmail(email: string) {
    return await this.usersRepository.findOneByEmail(email);
  }

  async findOneById(id: number) {
    return await this.usersRepository.getById(id);
  }
}
