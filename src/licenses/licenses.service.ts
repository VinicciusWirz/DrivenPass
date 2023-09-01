import { ConflictException, Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { CreateLicenseDto } from './dto/create-license.dto';
import { LicensesRepository } from './licenses.repository';

@Injectable()
export class LicensesService {
  constructor(private readonly repository: LicensesRepository) {}

  async create(body: CreateLicenseDto, user: User) {
    await this.findConflict(body, user);

    return await this.repository.create(body, user);
  }

  async findAll(user: User) {
    return await this.repository.findAllFromUser(user);
  }

  findOne(id: number) {
    return `This action returns a #${id} license`;
  }

  remove(id: number) {
    return `This action removes a #${id} license`;
  }

  private async findConflict(body: CreateLicenseDto, user: User) {
    const license = await this.repository.findConflict(body, user);
    if (license) {
      throw new ConflictException(
        'License already registered for this software',
      );
    }
    return;
  }
}
