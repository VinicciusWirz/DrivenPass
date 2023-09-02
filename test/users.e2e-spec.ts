import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { PrismaService } from '../src/prisma/prisma.service';
import { AuthModule } from '../src/auth/auth.module';
import { PrismaModule } from '../src/prisma/prisma.module';
import { AuthFactory } from './factories/auth.factory';
import { UsersModule } from '../src/users/users.module';
import { Helper } from './helpers/helper';
import { ConfigModule, ConfigService } from '@nestjs/config/dist';
import { CardsFactory } from './factories/cards.factory';
import { CredentialsFactory } from './factories/credentials.factory';
import { LicensesFactory } from './factories/licenses.factory';
import { WifisFactory } from './factories/wifis.factory';
import { NotesFactory } from './factories/notes.factory';
import { UsersFactory } from './factories/users.factory';

describe('Users (e2e)', () => {
  let app: INestApplication;
  const config = new ConfigService();
  const prisma = new PrismaService();
  const authFactory = new AuthFactory(prisma, config);
  const helper = new Helper(prisma, config);
  const cardsFactory = new CardsFactory(prisma, helper);
  const credentialsFactory = new CredentialsFactory(prisma, helper);
  const licensesFactory = new LicensesFactory(prisma);
  const wifisFactory = new WifisFactory(prisma, helper);
  const notesFactory = new NotesFactory(prisma);
  const usersFactory = new UsersFactory(
    prisma,
    cardsFactory,
    credentialsFactory,
    licensesFactory,
    wifisFactory,
    notesFactory,
  );

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

  describe('POST users/erase', () => {
    it("should delete all user's information", async () => {
      const dto = authFactory.generateDto();
      const user = await authFactory.createSignup(dto.password);
      const { token } = await authFactory.generateToken(user.email, user.id);

      const { amounts, count: countBefore } =
        await usersFactory.populateUserAccount(user);

      const response = await request(app.getHttpServer())
        .post('/users/erase')
        .set('Authorization', `bearer ${token}`)
        .send({ password: dto.password });

      const userExist = await usersFactory.findUser(user.id);
      const counts = await usersFactory.countUserData(user);

      expect(response.statusCode).toBe(HttpStatus.NO_CONTENT);
      expect(countBefore).toEqual(amounts);
      expect(userExist).toEqual(null);
      expect(counts.cards).toHaveLength(0);
      expect(counts.credentials).toHaveLength(0);
      expect(counts.licenses).toHaveLength(0);
      expect(counts.notes).toHaveLength(0);
      expect(counts.wifis).toHaveLength(0);
    });

    it("should return unauthorized error and not delete user's information if password confirmation is wrong", async () => {
      const user = await authFactory.createSignup();
      const { token } = await authFactory.generateToken(user.email, user.id);

      const { amounts, count: countBefore } =
        await usersFactory.populateUserAccount(user);

      const response = await request(app.getHttpServer())
        .post('/users/erase')
        .set('Authorization', `bearer ${token}`)
        .send({ password: 'left-password' });

      const userExist = await usersFactory.findUser(user.id);
      const counts = await usersFactory.countUserData(user);

      expect(response.statusCode).toBe(HttpStatus.UNAUTHORIZED);
      expect(countBefore).toEqual(amounts);
      expect(userExist).toEqual(user);
      expect(counts.cards).toHaveLength(countBefore.Card);
      expect(counts.credentials).toHaveLength(countBefore.Credential);
      expect(counts.licenses).toHaveLength(countBefore.License);
      expect(counts.notes).toHaveLength(countBefore.Note);
      expect(counts.wifis).toHaveLength(countBefore.Wifi);
    });

    it('should return unauthorized when token is missing', async () => {
      return request(app.getHttpServer())
        .post('/users/erase')
        .send({ password: 'left-password' })
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should return unauthorized when token is missing', async () => {
      const { token } = authFactory.genFaketoken();

      return request(app.getHttpServer())
        .post('/users/erase')
        .send({ password: 'left-password' })
        .set('Authorization', `bearer ${token}`)
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('GET users/count', () => {
    it("should return the count of all user's information", async () => {
      const user = await authFactory.createSignup();
      const { token } = await authFactory.generateToken(user.email, user.id);

      const { amounts, count } = await usersFactory.populateUserAccount(user);

      const response = await request(app.getHttpServer())
        .get('/users/count')
        .set('Authorization', `bearer ${token}`);

      expect(response.statusCode).toBe(HttpStatus.OK);
      expect(count).toEqual(amounts);
      expect(response.body).toEqual(count);
    });

    it('should return unauthorized when token is missing', async () => {
      return request(app.getHttpServer())
        .get('/users/count')
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should return unauthorized when token is missing', async () => {
      const { token } = authFactory.genFaketoken();

      return request(app.getHttpServer())
        .get('/users/count')
        .set('Authorization', `bearer ${token}`)
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });
});
