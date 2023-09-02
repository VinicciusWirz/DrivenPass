import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { PrismaService } from '../src/prisma/prisma.service';
import { AuthModule } from '../src/auth/auth.module';
import { PrismaModule } from '../src/prisma/prisma.module';
import { SignUpFactory } from './factories/sign-up.factory';
import { UsersModule } from '../src/users/users.module';
import { Helper } from './helpers/helper';
import { ConfigModule, ConfigService } from '@nestjs/config/dist';

describe('Auth (e2e)', () => {
  let app: INestApplication;
  const config = new ConfigService();
  const prisma = new PrismaService();
  const signUpFactory = new SignUpFactory(prisma, config);
  const helper = new Helper(prisma, config);

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        AuthModule,
        UsersModule,
        PrismaModule,
        ConfigModule.forRoot({ isGlobal: true }),
      ],
    })
      .overrideProvider(PrismaService)
      .useValue(prisma)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidUnknownValues: true,
        forbidNonWhitelisted: true,
      }),
    );

    await helper.cleanDB();
    await app.init();
  });

  describe('POST users/sign-up', () => {
    it('should register a new user', () => {
      return request(app.getHttpServer())
        .post('/auth/users/sign-up')
        .send({ email: 'valid_email@email.com', password: 'Str0nG!P4szwuRd' })
        .expect(HttpStatus.CREATED)
        .expect({ message: 'User created.' });
    });

    it('should return conflict when user is already registered', async () => {
      const { email } = await signUpFactory.createSignup();

      return request(app.getHttpServer())
        .post('/auth/users/sign-up')
        .send({ email, password: 'Str0nG!P4szwuRd' })
        .expect(HttpStatus.CONFLICT);
    });

    it('should return bad request error when email is not a valid email', () => {
      return request(app.getHttpServer())
        .post('/auth/users/sign-up')
        .send({ email: 'valid_email', password: 'Str0nG!P4szwuRd' })
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should return bad request error when password is not strong enough', () => {
      return request(app.getHttpServer())
        .post('/auth/users/sign-up')
        .send({ email: 'valid_email@email.com', password: 'password' })
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should return bad request error when request body is missing', () => {
      return request(app.getHttpServer())
        .post('/auth/users/sign-up')
        .send({})
        .expect(HttpStatus.BAD_REQUEST);
    });
  });

  describe('POST users/sign-in', () => {
    it('should sign-in into an account and send a token', async () => {
      const { email, nonCryptedPassword: password } =
        await signUpFactory.createSignup();

      const signIn = await request(app.getHttpServer())
        .post('/auth/users/sign-in')
        .send({ email, password });

      expect(signIn.statusCode).toBe(HttpStatus.OK);
      expect(signIn.body).toEqual({ token: expect.any(String) });
    });

    it('should return bad request error when body is not valid', () => {
      return request(app.getHttpServer())
        .post('/auth/users/sign-in')
        .send({})
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should return unauthorized error when body is not valid', async () => {
      const { email } = await signUpFactory.createSignup();

      return request(app.getHttpServer())
        .post('/auth/users/sign-in')
        .send({ email, password: 'wrong-password' })
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should return unauthorized error when user is not valid', async () => {
      return request(app.getHttpServer())
        .post('/auth/users/sign-in')
        .send({ email: 'not-an-user@email.com', password: 'random-password' })
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });
});
