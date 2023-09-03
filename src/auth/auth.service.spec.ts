import * as bcrypt from 'bcrypt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { UsersRepository } from '../users/users.repository';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/signUpDto';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JsonWebTokenError } from 'jsonwebtoken';
import { SignInDto } from './dto/signInDto';

describe('AuthService', () => {
  let service: AuthService;
  const prisma = new PrismaService();
  let repository: UsersRepository;
  let dto = new SignUpDto();
  let login = new SignInDto();
  const config = new ConfigService();
  const SALT = parseInt(config.get<string>('SALT'));

  dto.email = 'email@email.com';
  dto.password = 'Str0nG!P4szwuRd';
  login = { ...dto };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        JwtModule.register({}),
        ConfigModule.forRoot({
          isGlobal: true,
        }),
      ],
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
        email: login.email,
        password: bcrypt.hashSync(login.password, SALT),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      expect(await service.signIn(login)).toEqual({
        token: expect.any(String),
      });
    });

    it("should return throw Unauthorized error if user doesn't exist", () => {
      jest.spyOn(repository, 'findOneByEmail').mockResolvedValueOnce(null);

      expect(service.signIn(login)).rejects.toThrow(
        new UnauthorizedException(`Email or password not valid.`),
      );
    });

    it("should return throw Unauthorized error if password doesn't match", () => {
      jest.spyOn(repository, 'findOneByEmail').mockResolvedValueOnce({
        id: 1,
        email: login.email,
        password: '123',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      expect(service.signIn(login)).rejects.toThrow(
        new UnauthorizedException(`Email or password not valid.`),
      );
    });

    it("should return throw Unauthorized error if password doesn't match", () => {
      jest.spyOn(repository, 'findOneByEmail').mockResolvedValueOnce({
        id: 1,
        email: login.email,
        password: bcrypt.hashSync('123', SALT),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      expect(service.signIn(login)).rejects.toThrow(
        new UnauthorizedException(`Email or password not valid.`),
      );
    });
  });

  describe('Check verified token', () => {
    it('should decrypt a valid token', async () => {
      const userId = 1;
      jest.spyOn(repository, 'findOneByEmail').mockResolvedValueOnce({
        id: userId,
        email: login.email,
        password: bcrypt.hashSync(login.password, SALT),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const { token } = await service.signIn(login);
      const { email, sub, iss, aud } = service.checkToken(token);
      expect(email).toEqual(login.email);
      expect(aud).toEqual('users');
      expect(iss).toEqual('Driven');
      expect(sub).toEqual(userId.toString());
    });

    it('should throw jwt error if token is not valid', async () => {
      try {
        await service.checkToken('not.valid.token');

        fail('Expected an error to be thrown');
      } catch (error) {
        expect(error).toEqual(new JsonWebTokenError('invalid token'));
      }
    });
  });
});
