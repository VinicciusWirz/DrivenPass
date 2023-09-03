import * as bcrypt from 'bcrypt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PasswordConfirmationDto } from './dto/password-confirmation.dto';
import { UsersRepository } from './users.repository';
import { UsersService } from './users.service';
import { UnauthorizedException } from '@nestjs/common';
import { SignUpDto } from '../auth/dto/signUpDto';

describe('UsersService', () => {
  let service: UsersService;
  let repository: UsersRepository;
  const prisma = new PrismaService();
  const config = new ConfigService();
  const SALT = parseInt(config.get<string>('SALT'));
  const dto = new PasswordConfirmationDto();
  dto.password = 'mock-password';
  const signUpDto = new SignUpDto();
  signUpDto.email = 'mock@email.com';
  signUpDto.password = dto.password;

  const mockUser: User = {
    id: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    email: 'mock@email.com',
    password: bcrypt.hashSync(dto.password, SALT),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
        }),
      ],
      providers: [UsersService, UsersRepository, PrismaService],
    })
      .overrideProvider(PrismaService)
      .useValue(prisma)
      .compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<UsersRepository>(UsersRepository);
  });

  describe('Delete service test', () => {
    it('should delete all user information successfully', async () => {
      jest.spyOn(repository, 'delete').mockResolvedValueOnce(mockUser);

      expect(await service.delete(dto, mockUser)).toEqual(mockUser);
    });

    it("should throw unauthorized if password confirmation doesn't match", async () => {
      try {
        await service.delete({ password: 'wrong-password' }, mockUser);
      } catch (error) {
        expect(error).toEqual(
          new UnauthorizedException(`Password confirmation failed.`),
        );
      }
    });
  });

  describe('Count service test', () => {
    it('should return user amount of user information', async () => {
      const count = {
        Note: Math.ceil(Math.random() * 10),
        Card: Math.ceil(Math.random() * 10),
        Credential: Math.ceil(Math.random() * 10),
        License: Math.ceil(Math.random() * 10),
        Wifi: Math.ceil(Math.random() * 10),
      };
      jest.spyOn(repository, 'count').mockResolvedValueOnce({ _count: count });

      expect(await service.count(mockUser)).toEqual(count);
    });
  });

  describe('Create service test', () => {
    it('should return created user', async () => {
      jest.spyOn(repository, 'create').mockResolvedValueOnce(mockUser);
      expect(await service.create(signUpDto)).toEqual(mockUser);
    });
  });

  describe('FindOneByEmail service test', () => {
    it('should return user found', async () => {
      jest.spyOn(repository, 'findOneByEmail').mockResolvedValueOnce(mockUser);
      expect(await service.findOneByEmail(signUpDto.email)).toEqual(mockUser);
    });
  });

  describe('FindOneById service test', () => {
    it('should return user found', async () => {
      jest.spyOn(repository, 'getById').mockResolvedValueOnce(mockUser);
      expect(await service.findOneById(mockUser.id)).toEqual(mockUser);
    });
  });
});
