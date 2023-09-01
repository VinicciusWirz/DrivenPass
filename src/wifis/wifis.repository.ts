import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWifiDto } from './dto/create-wifi.dto';

@Injectable()
export class WifisRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(body: CreateWifiDto, user: User) {
    return this.prisma.wifi.create({
      data: {
        ...body,
        User: { connect: user },
      },
    });
  }
}
