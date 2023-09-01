import { Test, TestingModule } from '@nestjs/testing';
import { WifisService } from './wifis.service';

describe('WifisService', () => {
  let service: WifisService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WifisService],
    }).compile();

    service = module.get<WifisService>(WifisService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
