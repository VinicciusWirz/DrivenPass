import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { PrismaService } from '../src/prisma/prisma.service';
import { AuthModule } from '../src/auth/auth.module';
import { PrismaModule } from '../src/prisma/prisma.module';
import { UsersModule } from '../src/users/users.module';
import { Helper } from './helpers/helper';
import { WifisModule } from '../src/wifis/wifis.module';
import { WifisFactory } from './factories/wifis.factory';
import { AuthFactory } from './factories/auth.factory';
import { ConfigModule, ConfigService } from '@nestjs/config';

describe('Wifis (e2e)', () => {
  let app: INestApplication;
  const config = new ConfigService();
  const prisma = new PrismaService();
  const helper = new Helper(prisma, config);
  const authFactory = new AuthFactory(prisma, config);
  const wifisFactory = new WifisFactory(prisma, helper);

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        AuthModule,
        UsersModule,
        PrismaModule,
        WifisModule,
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

  describe('POST /wifis', () => {
    it('should register a new wifi', async () => {
      const { email, id: userId } = await authFactory.createSignup();
      const { token } = await authFactory.generateToken(email, userId);

      const dto = wifisFactory.generateDto();

      const response = await request(app.getHttpServer())
        .post('/wifis')
        .send(dto)
        .set('Authorization', `bearer ${token}`);
      expect(response.statusCode).toBe(HttpStatus.CREATED);
      expect(response.body).toEqual({
        ...dto,
        id: expect.any(Number),
        userId,
        password: expect.any(String),
        updatedAt: expect.any(String),
        createdAt: expect.any(String),
      });
    });

    it('should return unauthorized when token is missing', async () => {
      const dto = wifisFactory.generateDto();

      return request(app.getHttpServer())
        .post('/wifis')
        .send(dto)
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should return unauthorized when token is not valid', async () => {
      const dto = wifisFactory.generateDto();
      const { token } = authFactory.genFaketoken();

      return request(app.getHttpServer())
        .post('/wifis')
        .send(dto)
        .set('Authorization', `bearer ${token}`)
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should return bad request when body is not valid', async () => {
      const { email, id: userId } = await authFactory.createSignup();
      const { token } = await authFactory.generateToken(email, userId);

      return request(app.getHttpServer())
        .post('/wifis')
        .send({})
        .set('Authorization', `bearer ${token}`)
        .expect(HttpStatus.BAD_REQUEST);
    });
  });

  describe('GET /wifis', () => {
    it("should return all user's wifis", async () => {
      const user = await authFactory.createSignup();
      const { email, id: userId } = user;
      const { token } = await authFactory.generateToken(email, userId);
      const numberOfWifis = 5;
      for (let i = 0; i < numberOfWifis; i++) {
        await wifisFactory.registerWifi(user);
      }

      const wifis = await request(app.getHttpServer())
        .get('/wifis')
        .set('Authorization', `bearer ${token}`);

      expect(wifis.statusCode).toBe(HttpStatus.OK);
      expect(wifis.body).toHaveLength(numberOfWifis);
      expect(wifis.body[0]).toEqual({
        id: expect.any(Number),
        title: expect.any(String),
        password: expect.any(String),
        name: expect.any(String),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        userId,
      });
    });

    it('should return decrypted params', async () => {
      const user = await authFactory.createSignup();
      const { email, id: userId } = user;
      const { token } = await authFactory.generateToken(email, userId);

      const { body, deployed } = await wifisFactory.registerWifi(user);

      const wifis = await request(app.getHttpServer())
        .get('/wifis')
        .set('Authorization', `bearer ${token}`);

      expect(wifis.statusCode).toBe(HttpStatus.OK);
      expect(wifis.body[0]).toEqual({
        ...deployed,
        password: body.password,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });
    });

    it('should return unauthorized when token is missing', async () => {
      return request(app.getHttpServer())
        .get('/wifis')
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should return unauthorized when token is not valid', async () => {
      const { token } = authFactory.genFaketoken();
      return request(app.getHttpServer())
        .get('/wifis')
        .set('Authorization', `bearer ${token}`)
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('GET /wifis/:id', () => {
    it("should return specific user's wifi with decrypted params", async () => {
      const user = await authFactory.createSignup();
      const { email, id: userId } = user;
      const { token } = await authFactory.generateToken(email, userId);

      const { deployed, body } = await wifisFactory.registerWifi(user);

      const wifi = await request(app.getHttpServer())
        .get(`/wifis/${deployed.id}`)
        .set('Authorization', `bearer ${token}`);

      expect(wifi.statusCode).toBe(HttpStatus.OK);
      expect(wifi.body).toEqual({
        ...deployed,
        password: body.password,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });
    });

    it('should return unauthorized when token is missing', async () => {
      const user = await authFactory.createSignup();

      const { deployed } = await wifisFactory.registerWifi(user);

      return request(app.getHttpServer())
        .get(`/wifis/${deployed.id}`)
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should return unauthorized when token is not valid', async () => {
      const user = await authFactory.createSignup();

      const { deployed } = await wifisFactory.registerWifi(user);
      const { token } = authFactory.genFaketoken();

      return request(app.getHttpServer())
        .get(`/wifis/${deployed.id}`)
        .set('Authorization', `bearer ${token}`)
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should return bad request when id is not valid', async () => {
      const { email, id: userId } = await authFactory.createSignup();
      const { token } = await authFactory.generateToken(email, userId);

      const wifi = await request(app.getHttpServer())
        .get(`/wifis/A`)
        .set('Authorization', `bearer ${token}`);

      expect(wifi.statusCode).toBe(HttpStatus.BAD_REQUEST);
    });

    it("should return forbidden when wifi's id isn't from user", async () => {
      const user = await authFactory.createSignup();
      const { deployed } = await wifisFactory.registerWifi(user);

      const { email, id: userId } = await authFactory.createSignup();
      const { token } = await authFactory.generateToken(email, userId);

      const wifi = await request(app.getHttpServer())
        .get(`/wifis/${deployed.id}`)
        .set('Authorization', `bearer ${token}`);

      expect(wifi.statusCode).toBe(HttpStatus.FORBIDDEN);
    });

    it("should return not found when wifi's id doesn't exist", async () => {
      const { email, id: userId } = await authFactory.createSignup();
      const { token } = await authFactory.generateToken(email, userId);

      const wifi = await request(app.getHttpServer())
        .get(`/wifis/1`)
        .set('Authorization', `bearer ${token}`);

      expect(wifi.statusCode).toBe(HttpStatus.NOT_FOUND);
    });
  });

  describe('DELETE /wifis/:id', () => {
    it("should delete user's specific wifi", async () => {
      const user = await authFactory.createSignup();
      const { email, id: userId } = user;
      const { token } = await authFactory.generateToken(email, userId);

      const { deployed } = await wifisFactory.registerWifi(user);

      const wifi = await request(app.getHttpServer())
        .delete(`/wifis/${deployed.id}`)
        .set('Authorization', `bearer ${token}`);

      expect(wifi.statusCode).toBe(HttpStatus.NO_CONTENT);
    });

    it('should return unauthorized when token is missing', async () => {
      const user = await authFactory.createSignup();

      const { deployed } = await wifisFactory.registerWifi(user);

      return request(app.getHttpServer())
        .delete(`/wifis/${deployed.id}`)
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should return unauthorized when token is not valid', async () => {
      const user = await authFactory.createSignup();

      const { deployed } = await wifisFactory.registerWifi(user);

      const { token } = authFactory.genFaketoken();
      return request(app.getHttpServer())
        .delete(`/wifis/${deployed.id}`)
        .set('Authorization', `bearer ${token}`)
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should return bad request when id is not valid', async () => {
      const { email, id: userId } = await authFactory.createSignup();
      const { token } = await authFactory.generateToken(email, userId);

      const wifi = await request(app.getHttpServer())
        .delete(`/wifis/A`)
        .set('Authorization', `bearer ${token}`);

      expect(wifi.statusCode).toBe(HttpStatus.BAD_REQUEST);
    });

    it("should return forbidden when wifi's id isn't from user", async () => {
      const user = await authFactory.createSignup();
      const { deployed } = await wifisFactory.registerWifi(user);

      const { email, id: userId } = await authFactory.createSignup();
      const { token } = await authFactory.generateToken(email, userId);

      const wifi = await request(app.getHttpServer())
        .delete(`/wifis/${deployed.id}`)
        .set('Authorization', `bearer ${token}`);

      expect(wifi.statusCode).toBe(HttpStatus.FORBIDDEN);
    });

    it("should return not found when wifi's id doesn't exist", async () => {
      const { email, id: userId } = await authFactory.createSignup();
      const { token } = await authFactory.generateToken(email, userId);

      const wifi = await request(app.getHttpServer())
        .delete(`/wifis/1`)
        .set('Authorization', `bearer ${token}`);

      expect(wifi.statusCode).toBe(HttpStatus.NOT_FOUND);
    });
  });
});
