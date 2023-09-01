import { Module } from '@nestjs/common';
import { LicensesService } from './licenses.service';
import { LicensesController } from './licenses.controller';
import { LicensesRepository } from './licenses.repository';

@Module({
  controllers: [LicensesController],
  providers: [LicensesService, LicensesRepository],
})
export class LicensesModule {}
