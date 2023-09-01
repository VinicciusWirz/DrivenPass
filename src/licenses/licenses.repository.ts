import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLicenseDto } from './dto/create-license.dto';

@Injectable()
export class LicensesRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(body: CreateLicenseDto, user: User) {
    return this.prisma.license.create({
      data: {
        ...body,
        User: { connect: user },
      },
    });
  }

  findConflict(body: CreateLicenseDto, user: User) {
    return this.prisma.license.findUnique({
      where: {
        softwareName_softwareVersion_licenseKey_userId: {
          ...body,
          userId: user.id,
        },
      },
    });
  }
}
