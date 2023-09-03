import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PrismaUtils } from '../utils/prisma.utils';
import { CreateLicenseDto } from './dto/create-license.dto';
import { LicensesRepository } from './licenses.repository';
import { LicensesService } from './licenses.service';

describe('LicensesService', () => {
  let service: LicensesService;
  let repository: LicensesRepository;
  const prisma = new PrismaService();
  const prismaUtils = new PrismaUtils();
  const dto = new CreateLicenseDto();
  dto.licenseKey = '01234567891';
  dto.softwareName = 'mock-product';
  dto.softwareVersion = 'mock-version';

  const mockUser: User = {
    id: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    email: 'email@email.com',
    password: 'Str0nG!P4szwuRd',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LicensesService,
        LicensesRepository,
        PrismaService,
        PrismaUtils,
      ],
    })
      .overrideProvider(PrismaService)
      .useValue(prisma)
      .compile();

    service = module.get<LicensesService>(LicensesService);
    repository = module.get<LicensesRepository>(LicensesRepository);
  });

  describe('Create service test', () => {
    it('should return registered software license', async () => {
      const mockCreated = {
        ...dto,
        createdAt: new Date(),
        updatedAt: new Date(),
        id: 1,
        userId: 1,
      };
      jest.spyOn(repository, 'findConflict').mockResolvedValueOnce(null);
      jest.spyOn(repository, 'create').mockResolvedValueOnce(mockCreated);
      const create = await service.create(dto, mockUser);
      expect(create).toEqual(
        prismaUtils.exclude(mockCreated, 'createdAt', 'updatedAt', 'userId'),
      );
    });

    it('should throw conflict error when name, version and version is already registered for user', () => {
      const mockLicense = {
        ...dto,
        createdAt: new Date(),
        updatedAt: new Date(),
        id: 1,
        userId: 1,
      };
      jest.spyOn(repository, 'findConflict').mockResolvedValueOnce(mockLicense);

      expect(service.create(dto, mockUser)).rejects.toThrow(
        new ConflictException('License already registered for this software'),
      );
    });
  });

  describe('FindAll service test', () => {
    it("should return array of user's software licenses", async () => {
      const mockLicense = {
        ...dto,
        createdAt: new Date(),
        updatedAt: new Date(),
        id: 1,
        userId: 1,
      };
      jest
        .spyOn(repository, 'findAllFromUser')
        .mockResolvedValueOnce([mockLicense, mockLicense]);

      const findAll = await service.findAll(mockUser);
      expect(findAll).toHaveLength(2);
      expect(findAll[0]).toEqual(
        prismaUtils.exclude(mockLicense, 'createdAt', 'updatedAt', 'userId'),
      );
    });
  });

  describe('FindOne service test', () => {
    it("should return a user's software license", async () => {
      const mockLicense = {
        ...dto,
        createdAt: new Date(),
        updatedAt: new Date(),
        id: 1,
        userId: 1,
      };
      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(mockLicense);

      const findOne = await service.findOne(1, mockUser);
      expect(findOne).toEqual(
        prismaUtils.exclude(mockLicense, 'createdAt', 'updatedAt', 'userId'),
      );
    });

    it('should throw not found if software license is not found', () => {
      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(null);

      expect(service.findOne(1, mockUser)).rejects.toThrow(
        new NotFoundException("License register doesn't exist."),
      );
    });

    it("should throw forbidden if software license doesn't belong to user", () => {
      const mockLicense = {
        ...dto,
        createdAt: new Date(),
        updatedAt: new Date(),
        id: 1,
        userId: 99,
      };
      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(mockLicense);

      expect(service.findOne(1, mockUser)).rejects.toThrow(
        new ForbiddenException("License register doesn't belong to user."),
      );
    });
  });

  describe('Remove service test', () => {
    it('should delete software license', async () => {
      const mockLicense = {
        ...dto,
        createdAt: new Date(),
        updatedAt: new Date(),
        id: 1,
        userId: 1,
      };
      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(mockLicense);
      jest.spyOn(repository, 'remove').mockResolvedValueOnce(mockLicense);

      const create = await service.remove(1, mockUser);
      expect(create).toEqual(true);
    });

    it('should throw not found if software license is not found', () => {
      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(null);

      expect(service.remove(1, mockUser)).rejects.toThrow(
        new NotFoundException("License register doesn't exist."),
      );
    });

    it("should throw forbidden if software license doesn't belong to user", () => {
      const mockLicense = {
        ...dto,
        createdAt: new Date(),
        updatedAt: new Date(),
        id: 1,
        userId: 99,
      };
      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(mockLicense);

      expect(service.remove(1, mockUser)).rejects.toThrow(
        new ForbiddenException("License register doesn't belong to user."),
      );
    });
  });
});
