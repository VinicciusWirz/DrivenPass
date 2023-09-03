import { Global, Module } from '@nestjs/common';
import { PrismaUtils } from './prisma.utils';

@Global()
@Module({
  providers: [PrismaUtils],
  exports: [PrismaUtils],
})
export class UtilsModule {}
