import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { PrismaService } from '../src/prisma/prisma.service';
import { AuthModule } from '../src/auth/auth.module';
import { PrismaModule } from '../src/prisma/prisma.module';
import { UsersModule } from '../src/users/users.module';
import { Helper } from './helpers/helper';
import { CardsModule } from '../src/cards/cards.module';
import { CardsFactory } from './factories/cards.factory';
import { AuthFactory } from './factories/auth.factory';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UtilsModule } from '../src/utils/utils.module';

describe('Cards (e2e)', () => {
  let app: INestApplication;
  const config = new ConfigService();
  const prisma = new PrismaService();
  const helper = new Helper(prisma, config);
  const authFactory = new AuthFactory(prisma, config);
  const cardsFactory = new CardsFactory(prisma, helper);

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        AuthModule,
        UsersModule,
        PrismaModule,
        CardsModule,
        UtilsModule,
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

  describe('POST /cards', () => {
    it('should register a new card', async () => {
      const { email, id: userId } = await authFactory.createSignup();
      const { token } = await authFactory.generateToken(email, userId);

      const dto = cardsFactory.generateDto();
      const { cvv, password, ...rest } = dto;

      const response = await request(app.getHttpServer())
        .post('/cards')
        .send(dto)
        .set('Authorization', `bearer ${token}`);
      expect(response.statusCode).toBe(HttpStatus.CREATED);
      expect(response.body).toEqual({
        ...rest,
        id: expect.any(Number),
      });
    });

    it('should return unauthorized when token is missing', async () => {
      const dto = cardsFactory.generateDto();

      return request(app.getHttpServer())
        .post('/cards')
        .send(dto)
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should return unauthorized when token is not valid', async () => {
      const dto = cardsFactory.generateDto();
      const { token } = authFactory.genFaketoken();

      return request(app.getHttpServer())
        .post('/cards')
        .set('Authorization', `bearer ${token}`)
        .send(dto)
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should return bad request when body is not valid', async () => {
      const { email, id: userId } = await authFactory.createSignup();
      const { token } = await authFactory.generateToken(email, userId);

      return request(app.getHttpServer())
        .post('/cards')
        .send({})
        .set('Authorization', `bearer ${token}`)
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should return conflict when card title is already registered', async () => {
      const user = await authFactory.createSignup();
      const { email, id: userId } = user;
      const { token } = await authFactory.generateToken(email, userId);

      const { deployed } = await cardsFactory.registerCard(user);

      const dto = cardsFactory.generateDto();

      return request(app.getHttpServer())
        .post('/cards')
        .set('Authorization', `bearer ${token}`)
        .send({ ...dto, title: deployed.title })
        .expect(HttpStatus.CONFLICT);
    });
  });

  describe('GET /cards', () => {
    it("should return all user's cards", async () => {
      const user = await authFactory.createSignup();
      const { email, id: userId } = user;
      const { token } = await authFactory.generateToken(email, userId);
      const numberOfCards = 5;
      for (let i = 0; i < numberOfCards; i++) {
        await cardsFactory.registerCard(user);
      }

      const cards = await request(app.getHttpServer())
        .get('/cards')
        .set('Authorization', `bearer ${token}`);

      expect(cards.statusCode).toBe(HttpStatus.OK);
      expect(cards.body).toHaveLength(numberOfCards);
      expect(cards.body[0]).toEqual({
        id: expect.any(Number),
        cvv: expect.any(String),
        expiration: expect.any(String),
        name: expect.any(String),
        number: expect.any(String),
        password: expect.any(String),
        title: expect.any(String),
        type: expect.any(String),
        virtual: expect.any(Boolean),
      });
    });

    it('should return decrypted params', async () => {
      const user = await authFactory.createSignup();
      const { email, id: userId } = user;
      const { token } = await authFactory.generateToken(email, userId);

      const { body, deployed } = await cardsFactory.registerCard(user);
      const { userId: deployedUser, createdAt, updatedAt, ...resp } = deployed;

      const cards = await request(app.getHttpServer())
        .get('/cards')
        .set('Authorization', `bearer ${token}`);

      expect(cards.statusCode).toBe(HttpStatus.OK);
      expect(cards.body[0]).toEqual({
        ...resp,
        password: body.password,
        cvv: body.cvv,
      });
    });

    it('should return unauthorized when token is missing', async () => {
      return request(app.getHttpServer())
        .get('/cards')

        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should return unauthorized when token is not valid', async () => {
      const { token } = authFactory.genFaketoken();

      return request(app.getHttpServer())
        .get('/cards')
        .set('Authorization', `bearer ${token}`)
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('GET /cards/:id', () => {
    it("should return specific user's card with decrypted params", async () => {
      const user = await authFactory.createSignup();
      const { email, id: userId } = user;
      const { token } = await authFactory.generateToken(email, userId);

      const { deployed, body } = await cardsFactory.registerCard(user);
      const { userId: deployedUser, createdAt, updatedAt, ...resp } = deployed;

      const card = await request(app.getHttpServer())
        .get(`/cards/${deployed.id}`)
        .set('Authorization', `bearer ${token}`);

      expect(card.statusCode).toBe(HttpStatus.OK);
      expect(card.body).toEqual({
        ...resp,
        password: body.password,
        cvv: body.cvv,
      });
    });

    it('should return unauthorized when token is missing', async () => {
      const user = await authFactory.createSignup();

      const { deployed } = await cardsFactory.registerCard(user);

      return request(app.getHttpServer())
        .get(`/cards/${deployed.id}`)
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should return unauthorized when token is not valid', async () => {
      const user = await authFactory.createSignup();

      const { deployed } = await cardsFactory.registerCard(user);

      const { token } = authFactory.genFaketoken();

      return request(app.getHttpServer())
        .get(`/cards/${deployed.id}`)
        .set('Authorization', `bearer ${token}`)
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should return bad request when id is not valid', async () => {
      const { email, id: userId } = await authFactory.createSignup();
      const { token } = await authFactory.generateToken(email, userId);

      const card = await request(app.getHttpServer())
        .get(`/cards/A`)
        .set('Authorization', `bearer ${token}`);

      expect(card.statusCode).toBe(HttpStatus.BAD_REQUEST);
    });

    it("should return forbidden when card's id isn't from user", async () => {
      const user = await authFactory.createSignup();
      const { deployed } = await cardsFactory.registerCard(user);

      const { email, id: userId } = await authFactory.createSignup();
      const { token } = await authFactory.generateToken(email, userId);

      const card = await request(app.getHttpServer())
        .get(`/cards/${deployed.id}`)
        .set('Authorization', `bearer ${token}`);

      expect(card.statusCode).toBe(HttpStatus.FORBIDDEN);
    });

    it("should return not found when card's id doesn't exist", async () => {
      const { email, id: userId } = await authFactory.createSignup();
      const { token } = await authFactory.generateToken(email, userId);

      const card = await request(app.getHttpServer())
        .get(`/cards/1`)
        .set('Authorization', `bearer ${token}`);

      expect(card.statusCode).toBe(HttpStatus.NOT_FOUND);
    });
  });

  describe('DELETE /cards/:id', () => {
    it("should delete user's specific card", async () => {
      const user = await authFactory.createSignup();
      const { email, id: userId } = user;
      const { token } = await authFactory.generateToken(email, userId);

      const { deployed } = await cardsFactory.registerCard(user);

      const card = await request(app.getHttpServer())
        .delete(`/cards/${deployed.id}`)
        .set('Authorization', `bearer ${token}`);

      expect(card.statusCode).toBe(HttpStatus.NO_CONTENT);
    });

    it('should return unauthorized when token is missing', async () => {
      const user = await authFactory.createSignup();

      const { deployed } = await cardsFactory.registerCard(user);

      return request(app.getHttpServer())
        .delete(`/cards/${deployed.id}`)
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should return unauthorized when token is not valid', async () => {
      const user = await authFactory.createSignup();

      const { deployed } = await cardsFactory.registerCard(user);

      const { token } = authFactory.genFaketoken();

      return request(app.getHttpServer())
        .delete(`/cards/${deployed.id}`)
        .set('Authorization', `bearer ${token}`)
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should return bad request when id is not valid', async () => {
      const { email, id: userId } = await authFactory.createSignup();
      const { token } = await authFactory.generateToken(email, userId);

      const card = await request(app.getHttpServer())
        .delete(`/cards/A`)
        .set('Authorization', `bearer ${token}`);

      expect(card.statusCode).toBe(HttpStatus.BAD_REQUEST);
    });

    it("should return forbidden when card's id isn't from user", async () => {
      const user = await authFactory.createSignup();
      const { deployed } = await cardsFactory.registerCard(user);

      const { email, id: userId } = await authFactory.createSignup();
      const { token } = await authFactory.generateToken(email, userId);

      const card = await request(app.getHttpServer())
        .delete(`/cards/${deployed.id}`)
        .set('Authorization', `bearer ${token}`);

      expect(card.statusCode).toBe(HttpStatus.FORBIDDEN);
    });

    it("should return not found when card's id doesn't exist", async () => {
      const { email, id: userId } = await authFactory.createSignup();
      const { token } = await authFactory.generateToken(email, userId);

      const card = await request(app.getHttpServer())
        .delete(`/cards/1`)
        .set('Authorization', `bearer ${token}`);

      expect(card.statusCode).toBe(HttpStatus.NOT_FOUND);
    });
  });
});
