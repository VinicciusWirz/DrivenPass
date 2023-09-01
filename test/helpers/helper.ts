import { PrismaService } from '../../src/prisma/prisma.service';

export class Helper {
  static async cleanDB(prisma: PrismaService) {
    await prisma.user.deleteMany();
  }
}
