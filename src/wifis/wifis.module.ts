import { Module } from '@nestjs/common';
import { WifisService } from './wifis.service';
import { WifisController } from './wifis.controller';
import { WifisRepository } from './wifis.repository';

@Module({
  controllers: [WifisController],
  providers: [WifisService, WifisRepository],
})
export class WifisModule {}
