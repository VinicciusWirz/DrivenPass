import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { CardType, User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CardsRepository } from './cards.repository';
import { CardsService } from './cards.service';
import { CreateCardDto } from './dto/create-card.dto';

describe('CardsService', () => {
  let service: CardsService;
  let repository: CardsRepository;
  const prisma = new PrismaService();
  const dto = new CreateCardDto();
  dto.cvv = '111';
  dto.expiration = '01/99';
  dto.name = 'fake-name';
  dto.number = '12345678912';
  dto.password = '1234';
  dto.title = 'Mock Card';
  dto.type = CardType.BOTH;
  dto.virtual = true;

  const SALT = process.env.SALT;
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
      providers: [CardsService, CardsRepository, PrismaService],
    })
      .overrideProvider(PrismaService)
      .useValue(prisma)
      .compile();

    service = module.get<CardsService>(CardsService);
    repository = module.get<CardsRepository>(CardsRepository);
  });

  describe('Create service test', () => {
    it('should return registered card', async () => {
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
        ...mockCreated,
        password: expect.any(String),
        cvv: expect.any(String),
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
      jest.spyOn(repository, 'findWithTitle').mockResolvedValueOnce(null);
      jest.spyOn(repository, 'create').mockResolvedValueOnce(mockCreated);

      const create = await service.create(dto, mockUser);
      expect(create.cvv).not.toEqual(dto.cvv);
      expect(create.password).not.toEqual(dto.password);
    });

    it('should throw conflict error when title is already registered for user', () => {
      const mockCard = {
        ...dto,
        createdAt: new Date(),
        updatedAt: new Date(),
        id: 1,
        userId: 1,
      };
      jest.spyOn(repository, 'findWithTitle').mockResolvedValueOnce(mockCard);

      expect(service.create(dto, mockUser)).rejects.toThrow(
        new ConflictException('Title already registered'),
      );
    });
  });

  describe('FindAll service test', () => {
    it("should return array of user's cards", async () => {
      const mockCard = {
        ...dto,
        createdAt: new Date(),
        updatedAt: new Date(),
        id: 1,
        userId: 1,
      };
      jest
        .spyOn(repository, 'findAllFromUser')
        .mockResolvedValueOnce([mockCard, mockCard]);

      const findAll = await service.findAll(mockUser);
      expect(findAll).toHaveLength(2);
      expect(findAll[0]).toEqual({
        ...mockCard,
        password: expect.any(String),
        cvv: expect.any(String),
      });
    });

    it('should decrypt sensitive data', async () => {
      const mockCard = {
        ...dto,
        createdAt: new Date(),
        updatedAt: new Date(),
        id: 1,
        userId: 1,
      };
      jest
        .spyOn(repository, 'findAllFromUser')
        .mockResolvedValueOnce([mockCard]);

      const findAll = await service.findAll(mockUser);

      expect(findAll[0].password).not.toEqual(dto.password);
      expect(findAll[0].cvv).not.toEqual(dto.cvv);
    });
  });

  describe('FindOne service test', () => {
    it("should return a user's card", async () => {
      const mockCard = {
        ...dto,
        createdAt: new Date(),
        updatedAt: new Date(),
        id: 1,
        userId: 1,
      };
      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(mockCard);

      const findOne = await service.findOne(1, mockUser);
      expect(findOne).toEqual({
        ...mockCard,
        password: expect.any(String),
        cvv: expect.any(String),
      });
    });

    it('should decrypt sensitive data', async () => {
      const mockCard = {
        ...dto,
        createdAt: new Date(),
        updatedAt: new Date(),
        id: 1,
        userId: 1,
      };
      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(mockCard);

      const findOne = await service.findOne(1, mockUser);

      expect(findOne.password).not.toEqual(dto.password);
      expect(findOne.cvv).not.toEqual(dto.cvv);
    });

    it('should throw not found if card is not found', () => {
      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(null);

      expect(service.findOne(1, mockUser)).rejects.toThrow(
        new NotFoundException("Card doesn't exist."),
      );
    });

    it("should throw forbidden if card doesn't belong to user", () => {
      const mockCard = {
        ...dto,
        createdAt: new Date(),
        updatedAt: new Date(),
        id: 1,
        userId: 99,
      };
      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(mockCard);

      expect(service.findOne(1, mockUser)).rejects.toThrow(
        new ForbiddenException("Card doesn't belong to user."),
      );
    });
  });

  describe('Remove service test', () => {
    it('should delete card', async () => {
      const mockCard = {
        ...dto,
        createdAt: new Date(),
        updatedAt: new Date(),
        id: 1,
        userId: 1,
      };
      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(mockCard);
      jest.spyOn(repository, 'remove').mockResolvedValueOnce(mockCard);

      const create = await service.remove(1, mockUser);
      expect(create).toEqual(true);
    });

    it('should throw not found if card is not found', () => {
      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(null);

      expect(service.remove(1, mockUser)).rejects.toThrow(
        new NotFoundException("Card doesn't exist."),
      );
    });

    it("should throw forbidden if card doesn't belong to user", () => {
      const mockCard = {
        ...dto,
        createdAt: new Date(),
        updatedAt: new Date(),
        id: 1,
        userId: 99,
      };
      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(mockCard);

      expect(service.remove(1, mockUser)).rejects.toThrow(
        new ForbiddenException("Card doesn't belong to user."),
      );
    });
  });
});
