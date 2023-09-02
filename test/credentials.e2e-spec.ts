import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { PrismaService } from '../src/prisma/prisma.service';
import { AuthModule } from '../src/auth/auth.module';
import { PrismaModule } from '../src/prisma/prisma.module';
import { UsersModule } from '../src/users/users.module';
import { Helper } from './helpers/helper';
import { CredentialsModule } from '../src/credentials/credentials.module';
import { CredentialsFactory } from './factories/credentials.factory';
import { SignUpFactory } from './factories/sign-up.factory';
import { ConfigModule, ConfigService } from '@nestjs/config';

describe('Credentials (e2e)', () => {
  let app: INestApplication;
  const config = new ConfigService();
  const prisma = new PrismaService();
  const helper = new Helper(prisma, config);
  const signUpFactory = new SignUpFactory(prisma, config);
  const credentialsFactory = new CredentialsFactory(prisma, helper);

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        AuthModule,
        UsersModule,
        PrismaModule,
        CredentialsModule,
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

  describe('POST /credentials', () => {
    it('should register a new credential', async () => {
      const { email, id: userId } = await signUpFactory.createSignup();
      const { token } = await signUpFactory.generateToken(email, userId);

      const dto = credentialsFactory.generateDto();

      const response = await request(app.getHttpServer())
        .post('/credentials')
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
      const dto = credentialsFactory.generateDto();

      return request(app.getHttpServer())
        .post('/credentials')
        .send(dto)
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should return unauthorized when token is not valid', async () => {
      const dto = credentialsFactory.generateDto();
      const { token } = signUpFactory.genFaketoken();

      return request(app.getHttpServer())
        .post('/credentials')
        .send(dto)
        .set('Authorization', `bearer ${token}`)
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should return bad request when body is not valid', async () => {
      const { email, id: userId } = await signUpFactory.createSignup();
      const { token } = await signUpFactory.generateToken(email, userId);

      return request(app.getHttpServer())
        .post('/credentials')
        .send({})
        .set('Authorization', `bearer ${token}`)
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should return conflict when credential title is already registered', async () => {
      const { nonCryptedPassword, ...user } =
        await signUpFactory.createSignup();
      const { email, id: userId } = user;
      const { token } = await signUpFactory.generateToken(email, userId);

      const { deployed } = await credentialsFactory.registerCredential(user);

      const dto = credentialsFactory.generateDto();

      return request(app.getHttpServer())
        .post('/credentials')
        .set('Authorization', `bearer ${token}`)
        .send({ ...dto, title: deployed.title })
        .expect(HttpStatus.CONFLICT);
    });
  });

  describe('GET /credentials', () => {
    it("should return all user's credentials", async () => {
      const { nonCryptedPassword, ...user } =
        await signUpFactory.createSignup();
      const { email, id: userId } = user;
      const { token } = await signUpFactory.generateToken(email, userId);
      const numberOfCredentials = 5;
      for (let i = 0; i < numberOfCredentials; i++) {
        await credentialsFactory.registerCredential(user);
      }

      const credentials = await request(app.getHttpServer())
        .get('/credentials')
        .set('Authorization', `bearer ${token}`);

      expect(credentials.statusCode).toBe(HttpStatus.OK);
      expect(credentials.body).toHaveLength(numberOfCredentials);
      expect(credentials.body[0]).toEqual({
        id: expect.any(Number),
        title: expect.any(String),
        password: expect.any(String),
        url: expect.any(String),
        username: expect.any(String),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        userId,
      });
    });

    it('should return decrypted params', async () => {
      const { nonCryptedPassword, ...user } =
        await signUpFactory.createSignup();
      const { email, id: userId } = user;
      const { token } = await signUpFactory.generateToken(email, userId);

      const { body, deployed } =
        await credentialsFactory.registerCredential(user);

      const credentials = await request(app.getHttpServer())
        .get('/credentials')
        .set('Authorization', `bearer ${token}`);

      expect(credentials.statusCode).toBe(HttpStatus.OK);
      expect(credentials.body[0]).toEqual({
        ...deployed,
        password: body.password,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });
    });

    it('should return unauthorized when token is missing', async () => {
      return request(app.getHttpServer())
        .get('/credentials')
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should return unauthorized when token is not valid', async () => {
      const { token } = signUpFactory.genFaketoken();
      return request(app.getHttpServer())
        .get('/credentials')
        .set('Authorization', `bearer ${token}`)
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('GET /credentials/:id', () => {
    it("should return specific user's credential with decrypted params", async () => {
      const { nonCryptedPassword, ...user } =
        await signUpFactory.createSignup();
      const { email, id: userId } = user;
      const { token } = await signUpFactory.generateToken(email, userId);

      const { deployed, body } =
        await credentialsFactory.registerCredential(user);

      const credential = await request(app.getHttpServer())
        .get(`/credentials/${deployed.id}`)
        .set('Authorization', `bearer ${token}`);

      expect(credential.statusCode).toBe(HttpStatus.OK);
      expect(credential.body).toEqual({
        ...deployed,
        password: body.password,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });
    });

    it('should return unauthorized when token is missing', async () => {
      const { nonCryptedPassword, ...user } =
        await signUpFactory.createSignup();

      const { deployed } = await credentialsFactory.registerCredential(user);

      return request(app.getHttpServer())
        .get(`/credentials/${deployed.id}`)
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should return unauthorized when token is not valid', async () => {
      const { nonCryptedPassword, ...user } =
        await signUpFactory.createSignup();

      const { deployed } = await credentialsFactory.registerCredential(user);
      const { token } = signUpFactory.genFaketoken();

      return request(app.getHttpServer())
        .get(`/credentials/${deployed.id}`)
        .set('Authorization', `bearer ${token}`)
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should return bad request when id is not valid', async () => {
      const { email, id: userId } = await signUpFactory.createSignup();
      const { token } = await signUpFactory.generateToken(email, userId);

      const credential = await request(app.getHttpServer())
        .get(`/credentials/A`)
        .set('Authorization', `bearer ${token}`);

      expect(credential.statusCode).toBe(HttpStatus.BAD_REQUEST);
    });

    it("should return foribdden when credential's id isn't from user", async () => {
      const { nonCryptedPassword, ...user } =
        await signUpFactory.createSignup();
      const { deployed } = await credentialsFactory.registerCredential(user);

      const { email, id: userId } = await signUpFactory.createSignup();
      const { token } = await signUpFactory.generateToken(email, userId);

      const credential = await request(app.getHttpServer())
        .get(`/credentials/${deployed.id}`)
        .set('Authorization', `bearer ${token}`);

      expect(credential.statusCode).toBe(HttpStatus.FORBIDDEN);
    });

    it("should return not found when credential's id doesn't exist", async () => {
      const { email, id: userId } = await signUpFactory.createSignup();
      const { token } = await signUpFactory.generateToken(email, userId);

      const credential = await request(app.getHttpServer())
        .get(`/credentials/1`)
        .set('Authorization', `bearer ${token}`);

      expect(credential.statusCode).toBe(HttpStatus.NOT_FOUND);
    });
  });

  describe('DELETE /credentials/:id', () => {
    it("should delete user's specific credential", async () => {
      const { nonCryptedPassword, ...user } =
        await signUpFactory.createSignup();
      const { email, id: userId } = user;
      const { token } = await signUpFactory.generateToken(email, userId);

      const { deployed } = await credentialsFactory.registerCredential(user);

      const credential = await request(app.getHttpServer())
        .delete(`/credentials/${deployed.id}`)
        .set('Authorization', `bearer ${token}`);

      expect(credential.statusCode).toBe(HttpStatus.NO_CONTENT);
    });

    it('should return unauthorized when token is missing', async () => {
      const { nonCryptedPassword, ...user } =
        await signUpFactory.createSignup();

      const { deployed } = await credentialsFactory.registerCredential(user);

      return request(app.getHttpServer())
        .delete(`/credentials/${deployed.id}`)
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should return unauthorized when token is not valid', async () => {
      const { nonCryptedPassword, ...user } =
        await signUpFactory.createSignup();

      const { deployed } = await credentialsFactory.registerCredential(user);

      const { token } = signUpFactory.genFaketoken();
      return request(app.getHttpServer())
        .delete(`/credentials/${deployed.id}`)
        .set('Authorization', `bearer ${token}`)
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should return bad request when id is not valid', async () => {
      const { email, id: userId } = await signUpFactory.createSignup();
      const { token } = await signUpFactory.generateToken(email, userId);

      const credential = await request(app.getHttpServer())
        .delete(`/credentials/A`)
        .set('Authorization', `bearer ${token}`);

      expect(credential.statusCode).toBe(HttpStatus.BAD_REQUEST);
    });

    it("should return foribdden when credential's id isn't from user", async () => {
      const { nonCryptedPassword, ...user } =
        await signUpFactory.createSignup();
      const { deployed } = await credentialsFactory.registerCredential(user);

      const { email, id: userId } = await signUpFactory.createSignup();
      const { token } = await signUpFactory.generateToken(email, userId);

      const credential = await request(app.getHttpServer())
        .delete(`/credentials/${deployed.id}`)
        .set('Authorization', `bearer ${token}`);

      expect(credential.statusCode).toBe(HttpStatus.FORBIDDEN);
    });

    it("should return not found when credential's id doesn't exist", async () => {
      const { email, id: userId } = await signUpFactory.createSignup();
      const { token } = await signUpFactory.generateToken(email, userId);

      const credential = await request(app.getHttpServer())
        .delete(`/credentials/1`)
        .set('Authorization', `bearer ${token}`);

      expect(credential.statusCode).toBe(HttpStatus.NOT_FOUND);
    });
  });
});
