import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { PrismaService } from '../src/prisma/prisma.service';
import { AuthModule } from '../src/auth/auth.module';
import { PrismaModule } from '../src/prisma/prisma.module';
import { UsersModule } from '../src/users/users.module';
import { Helper } from './helpers/helper';
import { LicensesModule } from '../src/licenses/licenses.module';
import { LicensesFactory } from './factories/licenses.factory';
import { AuthFactory } from './factories/auth.factory';
import { ConfigModule, ConfigService } from '@nestjs/config';

describe('Licenses (e2e)', () => {
  let app: INestApplication;
  const config = new ConfigService();
  const prisma = new PrismaService();
  const helper = new Helper(prisma, config);
  const authFactory = new AuthFactory(prisma, config);
  const licensesFactory = new LicensesFactory(prisma);

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        AuthModule,
        UsersModule,
        PrismaModule,
        LicensesModule,
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

  describe('POST /licenses', () => {
    it('should register a new license', async () => {
      const { email, id: userId } = await authFactory.createSignup();
      const { token } = await authFactory.generateToken(email, userId);

      const dto = licensesFactory.generateDto();

      const response = await request(app.getHttpServer())
        .post('/licenses')
        .send(dto)
        .set('Authorization', `bearer ${token}`);
      expect(response.statusCode).toBe(HttpStatus.CREATED);
      expect(response.body).toEqual({
        ...dto,
        id: expect.any(Number),
        userId,
        updatedAt: expect.any(String),
        createdAt: expect.any(String),
      });
    });

    it('should return unauthorized when token is missing', async () => {
      const dto = licensesFactory.generateDto();

      return request(app.getHttpServer())
        .post('/licenses')
        .send(dto)
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should return unauthorized when token is not valid', async () => {
      const dto = licensesFactory.generateDto();
      const { token } = authFactory.genFaketoken();

      return request(app.getHttpServer())
        .post('/licenses')
        .send(dto)
        .set('Authorization', `bearer ${token}`)
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should return bad request when body is not valid', async () => {
      const { email, id: userId } = await authFactory.createSignup();
      const { token } = await authFactory.generateToken(email, userId);

      return request(app.getHttpServer())
        .post('/licenses')
        .send({})
        .set('Authorization', `bearer ${token}`)
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should return conflict when license title is already registered', async () => {
      const user = await authFactory.createSignup();
      const { email, id: userId } = user;
      const { token } = await authFactory.generateToken(email, userId);

      const { deployed } = await licensesFactory.registerLicense(user);
      const { licenseKey, softwareName, softwareVersion } = deployed;

      return request(app.getHttpServer())
        .post('/licenses')
        .set('Authorization', `bearer ${token}`)
        .send({
          softwareName,
          softwareVersion,
          licenseKey,
        })
        .expect(HttpStatus.CONFLICT);
    });
  });

  describe('GET /licenses', () => {
    it("should return all user's licenses", async () => {
      const user = await authFactory.createSignup();
      const { email, id: userId } = user;
      const { token } = await authFactory.generateToken(email, userId);
      const numberOfLicenses = 5;
      for (let i = 0; i < numberOfLicenses; i++) {
        await licensesFactory.registerLicense(user);
      }

      const licenses = await request(app.getHttpServer())
        .get('/licenses')
        .set('Authorization', `bearer ${token}`);

      expect(licenses.statusCode).toBe(HttpStatus.OK);
      expect(licenses.body).toHaveLength(numberOfLicenses);
      expect(licenses.body[0]).toEqual({
        id: expect.any(Number),
        softwareName: expect.any(String),
        softwareVersion: expect.any(String),
        licenseKey: expect.any(String),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        userId,
      });
    });

    it('should return unauthorized when token is missing', async () => {
      return request(app.getHttpServer())
        .get('/licenses')
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should return unauthorized when token is not valid', async () => {
      const { token } = authFactory.genFaketoken();
      return request(app.getHttpServer())
        .get('/licenses')
        .set('Authorization', `bearer ${token}`)
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('GET /licenses/:id', () => {
    it("should return specific user's license", async () => {
      const user = await authFactory.createSignup();
      const { email, id: userId } = user;
      const { token } = await authFactory.generateToken(email, userId);

      const { deployed } = await licensesFactory.registerLicense(user);

      const license = await request(app.getHttpServer())
        .get(`/licenses/${deployed.id}`)
        .set('Authorization', `bearer ${token}`);

      expect(license.statusCode).toBe(HttpStatus.OK);
      expect(license.body).toEqual({
        ...deployed,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });
    });

    it('should return unauthorized when token is missing', async () => {
      const user = await authFactory.createSignup();

      const { deployed } = await licensesFactory.registerLicense(user);

      return request(app.getHttpServer())
        .get(`/licenses/${deployed.id}`)
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should return unauthorized when token is not valid', async () => {
      const user = await authFactory.createSignup();

      const { deployed } = await licensesFactory.registerLicense(user);
      const { token } = authFactory.genFaketoken();

      return request(app.getHttpServer())
        .get(`/licenses/${deployed.id}`)
        .set('Authorization', `bearer ${token}`)
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should return bad request when id is not valid', async () => {
      const { email, id: userId } = await authFactory.createSignup();
      const { token } = await authFactory.generateToken(email, userId);

      const license = await request(app.getHttpServer())
        .get(`/licenses/A`)
        .set('Authorization', `bearer ${token}`);

      expect(license.statusCode).toBe(HttpStatus.BAD_REQUEST);
    });

    it("should return forbidden when license's id isn't from user", async () => {
      const user = await authFactory.createSignup();
      const { deployed } = await licensesFactory.registerLicense(user);

      const { email, id: userId } = await authFactory.createSignup();
      const { token } = await authFactory.generateToken(email, userId);

      const license = await request(app.getHttpServer())
        .get(`/licenses/${deployed.id}`)
        .set('Authorization', `bearer ${token}`);

      expect(license.statusCode).toBe(HttpStatus.FORBIDDEN);
    });

    it("should return not found when license's id doesn't exist", async () => {
      const { email, id: userId } = await authFactory.createSignup();
      const { token } = await authFactory.generateToken(email, userId);

      const license = await request(app.getHttpServer())
        .get(`/licenses/1`)
        .set('Authorization', `bearer ${token}`);

      expect(license.statusCode).toBe(HttpStatus.NOT_FOUND);
    });
  });

  describe('DELETE /licenses/:id', () => {
    it("should delete user's specific license", async () => {
      const user = await authFactory.createSignup();
      const { email, id: userId } = user;
      const { token } = await authFactory.generateToken(email, userId);

      const { deployed } = await licensesFactory.registerLicense(user);

      const license = await request(app.getHttpServer())
        .delete(`/licenses/${deployed.id}`)
        .set('Authorization', `bearer ${token}`);

      expect(license.statusCode).toBe(HttpStatus.NO_CONTENT);
    });

    it('should return unauthorized when token is missing', async () => {
      const user = await authFactory.createSignup();

      const { deployed } = await licensesFactory.registerLicense(user);

      return request(app.getHttpServer())
        .delete(`/licenses/${deployed.id}`)
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should return unauthorized when token is not valid', async () => {
      const user = await authFactory.createSignup();

      const { deployed } = await licensesFactory.registerLicense(user);

      const { token } = authFactory.genFaketoken();
      return request(app.getHttpServer())
        .delete(`/licenses/${deployed.id}`)
        .set('Authorization', `bearer ${token}`)
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should return bad request when id is not valid', async () => {
      const { email, id: userId } = await authFactory.createSignup();
      const { token } = await authFactory.generateToken(email, userId);

      const license = await request(app.getHttpServer())
        .delete(`/licenses/A`)
        .set('Authorization', `bearer ${token}`);

      expect(license.statusCode).toBe(HttpStatus.BAD_REQUEST);
    });

    it("should return forbidden when license's id isn't from user", async () => {
      const user = await authFactory.createSignup();
      const { deployed } = await licensesFactory.registerLicense(user);

      const { email, id: userId } = await authFactory.createSignup();
      const { token } = await authFactory.generateToken(email, userId);

      const license = await request(app.getHttpServer())
        .delete(`/licenses/${deployed.id}`)
        .set('Authorization', `bearer ${token}`);

      expect(license.statusCode).toBe(HttpStatus.FORBIDDEN);
    });

    it("should return not found when license's id doesn't exist", async () => {
      const { email, id: userId } = await authFactory.createSignup();
      const { token } = await authFactory.generateToken(email, userId);

      const license = await request(app.getHttpServer())
        .delete(`/licenses/1`)
        .set('Authorization', `bearer ${token}`);

      expect(license.statusCode).toBe(HttpStatus.NOT_FOUND);
    });
  });
});
