import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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

  async findOne(id: number, user: User) {
    const { id: userId } = user;
    const license = await this.repository.findOne(id);
    if (!license) {
      throw new NotFoundException("License register doesn't exist.");
    }
    if (license.userId !== userId) {
      throw new ForbiddenException("License register doesn't belong to user.");
    }

    return license;
  }

  async remove(id: number, user: User) {
    await this.findOne(id, user);
    await this.repository.remove(id, user);
    return true;
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
