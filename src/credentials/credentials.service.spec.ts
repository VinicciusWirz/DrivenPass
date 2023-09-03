import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PrismaUtils } from '../utils/prisma.utils';
import { CredentialsRepository } from './credentials.repository';
import { CredentialsService } from './credentials.service';
import { CreateCredentialDto } from './dto/create-credential.dto';

describe('CredentialsService', () => {
  let service: CredentialsService;
  let repository: CredentialsRepository;
  const prisma = new PrismaService();
  const prismaUtils = new PrismaUtils();
  const dto = new CreateCredentialDto();
  dto.url = 'mock-url';
  dto.title = 'mock-title';
  dto.username = 'mock-username';
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
      providers: [
        CredentialsService,
        CredentialsRepository,
        PrismaService,
        PrismaUtils,
      ],
    })
      .overrideProvider(PrismaService)
      .useValue(prisma)
      .compile();

    service = module.get<CredentialsService>(CredentialsService);
    repository = module.get<CredentialsRepository>(CredentialsRepository);
  });

  describe('Create service test', () => {
    it('should return registered credential', async () => {
      const mockCreated = {
        ...dto,
        createdAt: new Date(),
        updatedAt: new Date(),
        id: 1,
        userId: 1,
      };
      jest.spyOn(repository, 'findWithTitle').mockResolvedValueOnce(null);
      jest.spyOn(repository, 'create').mockResolvedValueOnce(mockCreated);
      const create = await service.create(dto, mockUser);
      expect(create).toEqual({
        ...prismaUtils.exclude(
          mockCreated,
          'userId',
          'createdAt',
          'updatedAt',
          'password',
        ),
      });
    });

    it('should throw conflict error when title is already registered for user', () => {
      const mockCredential = {
        ...dto,
        createdAt: new Date(),
        updatedAt: new Date(),
        id: 1,
        userId: 1,
      };
      jest
        .spyOn(repository, 'findWithTitle')
        .mockResolvedValueOnce(mockCredential);

      expect(service.create(dto, mockUser)).rejects.toThrow(
        new ConflictException('Title already registered'),
      );
    });
  });

  describe('FindAll service test', () => {
    it("should return array of user's credentials", async () => {
      const mockCredential = {
        ...dto,
        createdAt: new Date(),
        updatedAt: new Date(),
        id: 1,
        userId: 1,
      };
      jest
        .spyOn(repository, 'findAllFromUser')
        .mockResolvedValueOnce([mockCredential, mockCredential]);

      const findAll = await service.findAll(mockUser);
      expect(findAll).toHaveLength(2);
      expect(findAll[0]).toEqual({
        ...prismaUtils.exclude(
          mockCredential,
          'createdAt',
          'updatedAt',
          'userId',
        ),
        password: expect.any(String),
      });
    });

    it('should decrypt sensitive data', async () => {
      const mockCredential = {
        ...dto,
        createdAt: new Date(),
        updatedAt: new Date(),
        id: 1,
        userId: 1,
      };
      jest
        .spyOn(repository, 'findAllFromUser')
        .mockResolvedValueOnce([mockCredential]);

      const findAll = await service.findAll(mockUser);

      expect(findAll[0].password).not.toEqual(dto.password);
    });
  });

  describe('FindOne service test', () => {
    it("should return a user's credential", async () => {
      const mockCredential = {
        ...dto,
        createdAt: new Date(),
        updatedAt: new Date(),
        id: 1,
        userId: 1,
      };
      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(mockCredential);

      const findOne = await service.findOne(1, mockUser);
      expect(findOne).toEqual({
        ...prismaUtils.exclude(
          mockCredential,
          'createdAt',
          'updatedAt',
          'userId',
        ),
        password: expect.any(String),
      });
    });

    it('should decrypt sensitive data', async () => {
      const mockCredential = {
        ...dto,
        createdAt: new Date(),
        updatedAt: new Date(),
        id: 1,
        userId: 1,
      };
      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(mockCredential);

      const findOne = await service.findOne(1, mockUser);

      expect(findOne.password).not.toEqual(dto.password);
    });

    it('should throw not found if credential is not found', () => {
      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(null);

      expect(service.findOne(1, mockUser)).rejects.toThrow(
        new NotFoundException("Credential doesn't exist."),
      );
    });

    it("should throw forbidden if credential doesn't belong to user", () => {
      const mockCredential = {
        ...dto,
        createdAt: new Date(),
        updatedAt: new Date(),
        id: 1,
        userId: 99,
      };
      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(mockCredential);

      expect(service.findOne(1, mockUser)).rejects.toThrow(
        new ForbiddenException("Credential doesn't belong to user."),
      );
    });
  });

  describe('Remove service test', () => {
    it('should delete credential', async () => {
      const mockCredential = {
        ...dto,
        createdAt: new Date(),
        updatedAt: new Date(),
        id: 1,
        userId: 1,
      };
      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(mockCredential);
      jest.spyOn(repository, 'remove').mockResolvedValueOnce(mockCredential);

      const create = await service.remove(1, mockUser);
      expect(create).toEqual(true);
    });

    it('should throw not found if credential is not found', () => {
      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(null);

      expect(service.remove(1, mockUser)).rejects.toThrow(
        new NotFoundException("Credential doesn't exist."),
      );
    });

    it("should throw forbidden if credential doesn't belong to user", () => {
      const mockCredential = {
        ...dto,
        createdAt: new Date(),
        updatedAt: new Date(),
        id: 1,
        userId: 99,
      };
      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(mockCredential);

      expect(service.remove(1, mockUser)).rejects.toThrow(
        new ForbiddenException("Credential doesn't belong to user."),
      );
    });
  });
});
