import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWifiDto } from './dto/create-wifi.dto';
import { WifisRepository } from './wifis.repository';
import { WifisService } from './wifis.service';

describe('WifisService', () => {
  let service: WifisService;
  let repository: WifisRepository;
  const prisma = new PrismaService();
  const dto = new CreateWifiDto();
  dto.title = 'mock-title';
  dto.name = 'mock-name';
  dto.password = 'mock-password';

  const mockUser: User = {
    id: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    email: 'email@email.com',
    password: 'Str0nG!P4szwuRd',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
        }),
      ],
      providers: [WifisService, WifisRepository, PrismaService],
    })
      .overrideProvider(PrismaService)
      .useValue(prisma)
      .compile();

    service = module.get<WifisService>(WifisService);
    repository = module.get<WifisRepository>(WifisRepository);
  });

  describe('Create service test', () => {
    it('should return registered wifi', async () => {
      const mockCreated = {
        ...dto,
        createdAt: new Date(),
        updatedAt: new Date(),
        id: 1,
        userId: 1,
      };
      jest.spyOn(repository, 'create').mockResolvedValueOnce(mockCreated);
      const create = await service.create(dto, mockUser);
      expect(create).toEqual({
        ...mockCreated,
        password: expect.any(String),
      });
    });

    it('should encrypt sensitive data', async () => {
      const mockCreated = {
        ...dto,
        createdAt: new Date(),
        updatedAt: new Date(),
        id: 1,
        userId: 1,
      };
      jest.spyOn(repository, 'create').mockResolvedValueOnce(mockCreated);

      const create = await service.create(dto, mockUser);
      expect(create.password).not.toEqual(dto.password);
    });
  });

  describe('FindAll service test', () => {
    it("should return array of user's wifis", async () => {
      const mockWifi = {
        ...dto,
        createdAt: new Date(),
        updatedAt: new Date(),
        id: 1,
        userId: 1,
      };
      jest
        .spyOn(repository, 'findAllFromUser')
        .mockResolvedValueOnce([mockWifi, mockWifi]);

      const findAll = await service.findAll(mockUser);
      expect(findAll).toHaveLength(2);
      expect(findAll[0]).toEqual({
        ...mockWifi,
        password: expect.any(String),
      });
    });

    it('should decrypt sensitive data', async () => {
      const mockWifi = {
        ...dto,
        createdAt: new Date(),
        updatedAt: new Date(),
        id: 1,
        userId: 1,
      };
      jest
        .spyOn(repository, 'findAllFromUser')
        .mockResolvedValueOnce([mockWifi]);

      const findAll = await service.findAll(mockUser);

      expect(findAll[0].password).not.toEqual(dto.password);
    });
  });

  describe('FindOne service test', () => {
    it("should return a user's wifi", async () => {
      const mockWifi = {
        ...dto,
        createdAt: new Date(),
        updatedAt: new Date(),
        id: 1,
        userId: 1,
      };
      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(mockWifi);

      const findOne = await service.findOne(1, mockUser);
      expect(findOne).toEqual({
        ...mockWifi,
        password: expect.any(String),
      });
    });

    it('should decrypt sensitive data', async () => {
      const mockWifi = {
        ...dto,
        createdAt: new Date(),
        updatedAt: new Date(),
        id: 1,
        userId: 1,
      };
      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(mockWifi);

      const findOne = await service.findOne(1, mockUser);

      expect(findOne.password).not.toEqual(dto.password);
    });

    it('should throw not found if wifi is not found', () => {
      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(null);

      expect(service.findOne(1, mockUser)).rejects.toThrow(
        new NotFoundException("Wifi register doesn't exist."),
      );
    });

    it("should throw forbidden if wifi doesn't belong to user", () => {
      const mockWifi = {
        ...dto,
        createdAt: new Date(),
        updatedAt: new Date(),
        id: 1,
        userId: 99,
      };
      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(mockWifi);

      expect(service.findOne(1, mockUser)).rejects.toThrow(
        new ForbiddenException("Wifi register doesn't belong to user."),
      );
    });
  });

  describe('Remove service test', () => {
    it('should delete card', async () => {
      const mockWifi = {
        ...dto,
        createdAt: new Date(),
        updatedAt: new Date(),
        id: 1,
        userId: 1,
      };
      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(mockWifi);
      jest.spyOn(repository, 'remove').mockResolvedValueOnce(mockWifi);

      const create = await service.remove(1, mockUser);
      expect(create).toEqual(true);
    });

    it('should throw not found if card is not found', () => {
      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(null);

      expect(service.remove(1, mockUser)).rejects.toThrow(
        new NotFoundException("Wifi register doesn't exist."),
      );
    });

    it("should throw forbidden if card doesn't belong to user", () => {
      const mockWifi = {
        ...dto,
        createdAt: new Date(),
        updatedAt: new Date(),
        id: 1,
        userId: 99,
      };
      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(mockWifi);

      expect(service.remove(1, mockUser)).rejects.toThrow(
        new ForbiddenException("Wifi register doesn't belong to user."),
      );
    });
  });
});
