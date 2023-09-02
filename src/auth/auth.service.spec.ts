import * as bcrypt from 'bcrypt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { UsersRepository } from '../users/users.repository';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/signUpDto';
import { ConfigModule } from '@nestjs/config';

describe('AuthService', () => {
  let service: AuthService;
  let prisma = new PrismaService();
  let repository: UsersRepository;
  let dto = new SignUpDto();
  const SALT = process.env.SALT;

  dto.email = 'email@email.com';
  dto.password = 'Str0nG!P4szwuRd';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [JwtModule.register({})],
      providers: [
        AuthService,
        PrismaService,
        UsersService,
        UsersRepository,
        ConfigModule,
      ],
    })
      .overrideProvider(PrismaService)
      .useValue(prisma)
      .compile();

    service = module.get<AuthService>(AuthService);
    repository = module.get<UsersRepository>(UsersRepository);
  });

  describe('Sign-up service test', () => {
    it('should return sucessfull message', async () => {
      jest.spyOn(repository, 'findOneByEmail').mockResolvedValueOnce(null);
      jest.spyOn(repository, 'create').mockResolvedValueOnce(null);

      expect(await service.signUp(dto)).toEqual({
        message: 'User created.',
      });
    });

    it('should return throw Conflict error if user exist', () => {
      jest.spyOn(repository, 'findOneByEmail').mockResolvedValueOnce({
        id: 1,
        email: dto.email,
        password: dto.password,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      expect(service.signUp(dto)).rejects.toThrow(new ConflictException());
    });
  });

  describe('Sign-in service test', () => {
    it('should return sucessfull message', async () => {
      jest.spyOn(repository, 'findOneByEmail').mockResolvedValueOnce({
        id: 1,
        email: dto.email,
        password: bcrypt.hashSync(dto.password, SALT),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      expect(await service.signIn(dto)).toEqual({
        token: expect.any(String),
      });
    });

    it("should return throw Unauthorized error if user doesn't exist", () => {
      jest.spyOn(repository, 'findOneByEmail').mockResolvedValueOnce(null);

      expect(service.signIn(dto)).rejects.toThrow(
        new UnauthorizedException(`Email or password not valid.`),
      );
    });

    it("should return throw Unauthorized error if password doesn't match", () => {
      jest.spyOn(repository, 'findOneByEmail').mockResolvedValueOnce({
        id: 1,
        email: dto.email,
        password: bcrypt.hashSync('123', SALT),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      expect(service.signIn(dto)).rejects.toThrow(
        new UnauthorizedException(`Email or password not valid.`),
      );
    });
  });
});
