import * as bcrypt from 'bcrypt';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { User } from '@prisma/client';
import { SignUpDto } from '../auth/dto/signUpDto';
import { UserVerificationDto } from './dto/user-verification.dto';
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

  async delete(body: UserVerificationDto, user: User) {
    const { password } = body;
    const confirmation = await bcrypt.compare(password, user.password);
    if (!confirmation) {
      throw new UnauthorizedException(`Password confirmation failed.`);
    }

    return await this.usersRepository.delete(user);
  }

  async count(user: User) {
    const userInfo = await this.usersRepository.count(user);

    return userInfo._count
  }
}
