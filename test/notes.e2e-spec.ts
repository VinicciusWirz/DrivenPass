import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { PrismaService } from '../src/prisma/prisma.service';
import { AuthModule } from '../src/auth/auth.module';
import { PrismaModule } from '../src/prisma/prisma.module';
import { UsersModule } from '../src/users/users.module';
import { Helper } from './helpers/helper';
import { NotesModule } from '../src/notes/notes.module';
import { NotesFactory } from './factories/notes.factory';
import { SignUpFactory } from './factories/sign-up.factory';
import { ConfigModule, ConfigService } from '@nestjs/config';

describe('Notes (e2e)', () => {
  let app: INestApplication;
  const config = new ConfigService();
  const prisma = new PrismaService();
  const helper = new Helper(prisma, config);
  const signUpFactory = new SignUpFactory(prisma, config);
  const notesFactory = new NotesFactory(prisma);

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        AuthModule,
        UsersModule,
        PrismaModule,
        NotesModule,
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

  describe('POST /notes', () => {
    it('should register a new note', async () => {
      const { email, id: userId } = await signUpFactory.createSignup();
      const { token } = await signUpFactory.generateToken(email, userId);

      const dto = notesFactory.generateDto();

      const response = await request(app.getHttpServer())
        .post('/notes')
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
      const dto = notesFactory.generateDto();

      return request(app.getHttpServer())
        .post('/notes')
        .send(dto)
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should return unauthorized when token is not valid', async () => {
      const dto = notesFactory.generateDto();
      const { token } = signUpFactory.genFaketoken();

      return request(app.getHttpServer())
        .post('/notes')
        .send(dto)
        .set('Authorization', `bearer ${token}`)
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should return bad request when body is not valid', async () => {
      const { email, id: userId } = await signUpFactory.createSignup();
      const { token } = await signUpFactory.generateToken(email, userId);

      return request(app.getHttpServer())
        .post('/notes')
        .send({})
        .set('Authorization', `bearer ${token}`)
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should return conflict when note title is already registered', async () => {
      const user = await signUpFactory.createSignup();
      const { email, id: userId } = user;
      const { token } = await signUpFactory.generateToken(email, userId);

      const { deployed } = await notesFactory.registerNote(user);

      const dto = notesFactory.generateDto();

      return request(app.getHttpServer())
        .post('/notes')
        .set('Authorization', `bearer ${token}`)
        .send({ ...dto, title: deployed.title })
        .expect(HttpStatus.CONFLICT);
    });
  });

  describe('GET /notes', () => {
    it("should return all user's notes", async () => {
      const user = await signUpFactory.createSignup();
      const { email, id: userId } = user;
      const { token } = await signUpFactory.generateToken(email, userId);
      const numberOfNotes = 5;
      for (let i = 0; i < numberOfNotes; i++) {
        await notesFactory.registerNote(user);
      }

      const notes = await request(app.getHttpServer())
        .get('/notes')
        .set('Authorization', `bearer ${token}`);

      expect(notes.statusCode).toBe(HttpStatus.OK);
      expect(notes.body).toHaveLength(numberOfNotes);
      expect(notes.body[0]).toEqual({
        id: expect.any(Number),
        title: expect.any(String),
        text: expect.any(String),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        userId,
      });
    });

    it('should return unauthorized when token is missing', async () => {
      return request(app.getHttpServer())
        .get('/notes')
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should return unauthorized when token is not valid', async () => {
      const { token } = signUpFactory.genFaketoken();
      return request(app.getHttpServer())
        .get('/notes')
        .set('Authorization', `bearer ${token}`)
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('GET /notes/:id', () => {
    it("should return specific user's note", async () => {
      const user = await signUpFactory.createSignup();
      const { email, id: userId } = user;
      const { token } = await signUpFactory.generateToken(email, userId);

      const { deployed } = await notesFactory.registerNote(user);

      const note = await request(app.getHttpServer())
        .get(`/notes/${deployed.id}`)
        .set('Authorization', `bearer ${token}`);

      expect(note.statusCode).toBe(HttpStatus.OK);
      expect(note.body).toEqual({
        ...deployed,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });
    });

    it('should return unauthorized when token is missing', async () => {
      const user = await signUpFactory.createSignup();

      const { deployed } = await notesFactory.registerNote(user);

      return request(app.getHttpServer())
        .get(`/notes/${deployed.id}`)
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should return unauthorized when token is not valid', async () => {
      const user = await signUpFactory.createSignup();

      const { deployed } = await notesFactory.registerNote(user);
      const { token } = signUpFactory.genFaketoken();

      return request(app.getHttpServer())
        .get(`/notes/${deployed.id}`)
        .set('Authorization', `bearer ${token}`)
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should return bad request when id is not valid', async () => {
      const { email, id: userId } = await signUpFactory.createSignup();
      const { token } = await signUpFactory.generateToken(email, userId);

      const note = await request(app.getHttpServer())
        .get(`/notes/A`)
        .set('Authorization', `bearer ${token}`);

      expect(note.statusCode).toBe(HttpStatus.BAD_REQUEST);
    });

    it("should return forbidden when note's id isn't from user", async () => {
      const user = await signUpFactory.createSignup();
      const { deployed } = await notesFactory.registerNote(user);

      const { email, id: userId } = await signUpFactory.createSignup();
      const { token } = await signUpFactory.generateToken(email, userId);

      const note = await request(app.getHttpServer())
        .get(`/notes/${deployed.id}`)
        .set('Authorization', `bearer ${token}`);

      expect(note.statusCode).toBe(HttpStatus.FORBIDDEN);
    });

    it("should return not found when note's id doesn't exist", async () => {
      const { email, id: userId } = await signUpFactory.createSignup();
      const { token } = await signUpFactory.generateToken(email, userId);

      const note = await request(app.getHttpServer())
        .get(`/notes/1`)
        .set('Authorization', `bearer ${token}`);

      expect(note.statusCode).toBe(HttpStatus.NOT_FOUND);
    });
  });

  describe('PUT /notes/:id', () => {
    it("should update user's specific note", async () => {
      const user = await signUpFactory.createSignup();
      const { email, id: userId } = user;
      const { token } = await signUpFactory.generateToken(email, userId);

      const { deployed } = await notesFactory.registerNote(user);
      const dto = notesFactory.generateDto();

      const note = await request(app.getHttpServer())
        .put(`/notes/${deployed.id}`)
        .set('Authorization', `bearer ${token}`)
        .send(dto);

      expect(note.statusCode).toBe(HttpStatus.OK);
    });

    it("should update user's specific note's title", async () => {
      const user = await signUpFactory.createSignup();
      const { email, id: userId } = user;
      const { token } = await signUpFactory.generateToken(email, userId);

      const { deployed } = await notesFactory.registerNote(user);
      const { title } = notesFactory.generateDto();

      const note = await request(app.getHttpServer())
        .put(`/notes/${deployed.id}`)
        .set('Authorization', `bearer ${token}`)
        .send({ title });

      expect(note.statusCode).toBe(HttpStatus.OK);
    });

    it("should update user's specific note's text", async () => {
      const user = await signUpFactory.createSignup();
      const { email, id: userId } = user;
      const { token } = await signUpFactory.generateToken(email, userId);

      const { deployed } = await notesFactory.registerNote(user);
      const { text } = notesFactory.generateDto();

      const note = await request(app.getHttpServer())
        .put(`/notes/${deployed.id}`)
        .set('Authorization', `bearer ${token}`)
        .send({ text });

      expect(note.statusCode).toBe(HttpStatus.OK);
    });

    it("should return conflict when new title already exists user's specific note", async () => {
      const user = await signUpFactory.createSignup();
      const { email, id: userId } = user;
      const { token } = await signUpFactory.generateToken(email, userId);
      const { deployed: otherNote } = await notesFactory.registerNote(user);

      const { deployed } = await notesFactory.registerNote(user);
      const dto = notesFactory.generateDto();

      const note = await request(app.getHttpServer())
        .put(`/notes/${deployed.id}`)
        .set('Authorization', `bearer ${token}`)
        .send({ ...dto, title: otherNote.title });

      expect(note.statusCode).toBe(HttpStatus.CONFLICT);
    });

    it('should return unauthorized when token is missing', async () => {
      const user = await signUpFactory.createSignup();

      const { deployed } = await notesFactory.registerNote(user);
      const dto = notesFactory.generateDto();

      return request(app.getHttpServer())
        .put(`/notes/${deployed.id}`)
        .send(dto)
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should return unauthorized when token is not valid', async () => {
      const user = await signUpFactory.createSignup();

      const { deployed } = await notesFactory.registerNote(user);
      const dto = notesFactory.generateDto();

      const { token } = signUpFactory.genFaketoken();
      return request(app.getHttpServer())
        .put(`/notes/${deployed.id}`)
        .set('Authorization', `bearer ${token}`)
        .send(dto)
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should return bad request when id is not valid', async () => {
      const { email, id: userId } = await signUpFactory.createSignup();
      const { token } = await signUpFactory.generateToken(email, userId);

      const dto = notesFactory.generateDto();

      const note = await request(app.getHttpServer())
        .put(`/notes/A`)
        .set('Authorization', `bearer ${token}`)
        .send(dto);

      expect(note.statusCode).toBe(HttpStatus.BAD_REQUEST);
    });

    it("should return forbidden when note's id isn't from user", async () => {
      const user = await signUpFactory.createSignup();
      const { deployed } = await notesFactory.registerNote(user);

      const { email, id: userId } = await signUpFactory.createSignup();
      const { token } = await signUpFactory.generateToken(email, userId);

      const dto = notesFactory.generateDto();

      const note = await request(app.getHttpServer())
        .put(`/notes/${deployed.id}`)
        .set('Authorization', `bearer ${token}`)
        .send(dto);

      expect(note.statusCode).toBe(HttpStatus.FORBIDDEN);
    });

    it("should return not found when note's id doesn't exist", async () => {
      const { email, id: userId } = await signUpFactory.createSignup();
      const { token } = await signUpFactory.generateToken(email, userId);

      const dto = notesFactory.generateDto();

      const note = await request(app.getHttpServer())
        .put(`/notes/1`)
        .set('Authorization', `bearer ${token}`)
        .send(dto);

      expect(note.statusCode).toBe(HttpStatus.NOT_FOUND);
    });
  });

  describe('DELETE /notes/:id', () => {
    it("should delete user's specific note", async () => {
      const user = await signUpFactory.createSignup();
      const { email, id: userId } = user;
      const { token } = await signUpFactory.generateToken(email, userId);

      const { deployed } = await notesFactory.registerNote(user);

      const note = await request(app.getHttpServer())
        .delete(`/notes/${deployed.id}`)
        .set('Authorization', `bearer ${token}`);

      expect(note.statusCode).toBe(HttpStatus.NO_CONTENT);
    });

    it('should return unauthorized when token is missing', async () => {
      const user = await signUpFactory.createSignup();

      const { deployed } = await notesFactory.registerNote(user);

      return request(app.getHttpServer())
        .delete(`/notes/${deployed.id}`)
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should return unauthorized when token is not valid', async () => {
      const user = await signUpFactory.createSignup();

      const { deployed } = await notesFactory.registerNote(user);

      const { token } = signUpFactory.genFaketoken();
      return request(app.getHttpServer())
        .delete(`/notes/${deployed.id}`)
        .set('Authorization', `bearer ${token}`)
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should return bad request when id is not valid', async () => {
      const { email, id: userId } = await signUpFactory.createSignup();
      const { token } = await signUpFactory.generateToken(email, userId);

      const note = await request(app.getHttpServer())
        .delete(`/notes/A`)
        .set('Authorization', `bearer ${token}`);

      expect(note.statusCode).toBe(HttpStatus.BAD_REQUEST);
    });

    it("should return forbidden when note's id isn't from user", async () => {
      const user = await signUpFactory.createSignup();
      const { deployed } = await notesFactory.registerNote(user);

      const { email, id: userId } = await signUpFactory.createSignup();
      const { token } = await signUpFactory.generateToken(email, userId);

      const note = await request(app.getHttpServer())
        .delete(`/notes/${deployed.id}`)
        .set('Authorization', `bearer ${token}`);

      expect(note.statusCode).toBe(HttpStatus.FORBIDDEN);
    });

    it("should return not found when note's id doesn't exist", async () => {
      const { email, id: userId } = await signUpFactory.createSignup();
      const { token } = await signUpFactory.generateToken(email, userId);

      const note = await request(app.getHttpServer())
        .delete(`/notes/1`)
        .set('Authorization', `bearer ${token}`);

      expect(note.statusCode).toBe(HttpStatus.NOT_FOUND);
    });
  });
});
