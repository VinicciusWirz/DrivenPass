import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PrismaUtils } from '../utils/prisma.utils';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { NotesRepository } from './notes.repository';
import { NotesService } from './notes.service';

describe('NotesService', () => {
  let service: NotesService;
  let repository: NotesRepository;
  const prisma = new PrismaService();
  const prismaUtils = new PrismaUtils();
  const dto = new CreateNoteDto();
  dto.title = 'mock-title';
  dto.text = 'mock-text';

  const mockUser: User = {
    id: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    email: 'email@email.com',
    password: 'Str0nG!P4szwuRd',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NotesService, NotesRepository, PrismaService, PrismaUtils],
    })
      .overrideProvider(PrismaService)
      .useValue(prisma)
      .compile();

    service = module.get<NotesService>(NotesService);
    repository = module.get<NotesRepository>(NotesRepository);
  });

  describe('Create service test', () => {
    it('should return registered note', async () => {
      const mockCreated = {
        ...dto,
        createdAt: new Date(),
        updatedAt: new Date(),
        id: 1,
        userId: 1,
      };
      jest.spyOn(repository, 'findWithTitle').mockResolvedValueOnce(null);
      jest.spyOn(repository, 'create').mockResolvedValueOnce(mockCreated);
      const create = await service.create(dto, mockUser);
      expect(create).toEqual(
        prismaUtils.exclude(mockCreated, 'createdAt', 'updatedAt', 'userId'),
      );
    });

    it('should throw conflict error when title is already registered for user', () => {
      const mockNote = {
        ...dto,
        createdAt: new Date(),
        updatedAt: new Date(),
        id: 1,
        userId: 1,
      };
      jest.spyOn(repository, 'findWithTitle').mockResolvedValueOnce(mockNote);

      expect(service.create(dto, mockUser)).rejects.toThrow(
        new ConflictException('Title already registered'),
      );
    });
  });

  describe('FindAll service test', () => {
    it("should return array of user's notes", async () => {
      const mockNote = {
        ...dto,
        createdAt: new Date(),
        updatedAt: new Date(),
        id: 1,
        userId: 1,
      };
      jest
        .spyOn(repository, 'findAllFromUser')
        .mockResolvedValueOnce([mockNote, mockNote]);

      const findAll = await service.findAll(mockUser);
      expect(findAll).toHaveLength(2);
      expect(findAll[0]).toEqual(
        prismaUtils.exclude(mockNote, 'createdAt', 'updatedAt', 'userId'),
      );
    });
  });

  describe('FindOne service test', () => {
    it("should return a user's note", async () => {
      const mockNote = {
        ...dto,
        createdAt: new Date(),
        updatedAt: new Date(),
        id: 1,
        userId: 1,
      };
      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(mockNote);

      const findOne = await service.findOne(1, mockUser);
      expect(findOne).toEqual(
        prismaUtils.exclude(mockNote, 'createdAt', 'updatedAt', 'userId'),
      );
    });

    it('should throw not found if note is not found', () => {
      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(null);

      expect(service.findOne(1, mockUser)).rejects.toThrow(
        new NotFoundException("Note doesn't exist."),
      );
    });

    it("should throw forbidden if note doesn't belong to user", () => {
      const mockNote = {
        ...dto,
        createdAt: new Date(),
        updatedAt: new Date(),
        id: 1,
        userId: 99,
      };
      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(mockNote);

      expect(service.findOne(1, mockUser)).rejects.toThrow(
        new ForbiddenException("Note doesn't belong to user."),
      );
    });
  });

  describe('Update service test', () => {
    it('should return updated text note', async () => {
      const updateDto = new UpdateNoteDto();
      updateDto.text = 'new-mock-text';
      const mockNote = {
        ...dto,
        createdAt: new Date(),
        updatedAt: new Date(),
        id: 1,
        userId: 1,
      };
      const mockUpdate = { ...mockNote, ...updateDto };

      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(mockNote);
      jest.spyOn(repository, 'findWithTitle').mockResolvedValueOnce(null);
      jest.spyOn(repository, 'update').mockResolvedValueOnce(mockUpdate);
      const update = await service.update(1, updateDto, mockUser);
      expect(update).toEqual(
        prismaUtils.exclude(mockUpdate, 'createdAt', 'updatedAt', 'userId'),
      );
    });

    it('should return updated title note', async () => {
      const updateDto = new UpdateNoteDto();
      updateDto.title = 'new-mock-title';
      const mockNote = {
        ...dto,
        createdAt: new Date(),
        updatedAt: new Date(),
        id: 1,
        userId: 1,
      };
      const mockUpdate = { ...mockNote, ...updateDto };

      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(mockNote);
      jest.spyOn(repository, 'findWithTitle').mockResolvedValueOnce(null);
      jest.spyOn(repository, 'update').mockResolvedValueOnce(mockUpdate);
      const update = await service.update(1, updateDto, mockUser);
      expect(update).toEqual(
        prismaUtils.exclude(mockUpdate, 'createdAt', 'updatedAt', 'userId'),
      );
    });

    it('should return updated note', async () => {
      const updateDto = new UpdateNoteDto();
      updateDto.title = 'new-mock-title';
      updateDto.text = 'new-mock-text';
      const mockNote = {
        ...dto,
        createdAt: new Date(),
        updatedAt: new Date(),
        id: 1,
        userId: 1,
      };
      const mockUpdate = { ...mockNote, ...updateDto };

      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(mockNote);
      jest.spyOn(repository, 'findWithTitle').mockResolvedValueOnce(null);
      jest.spyOn(repository, 'update').mockResolvedValueOnce(mockUpdate);
      const update = await service.update(1, updateDto, mockUser);
      expect(update).toEqual(
        prismaUtils.exclude(mockUpdate, 'createdAt', 'updatedAt', 'userId'),
      );
    });

    it('should throw conflict error when title is already registered for user', () => {
      const updateDto = new UpdateNoteDto();
      updateDto.title = 'new-mock-title';
      const mockNote = {
        ...dto,
        createdAt: new Date(),
        updatedAt: new Date(),
        id: 1,
        userId: 1,
      };
      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(mockNote);
      jest
        .spyOn(repository, 'findWithTitle')
        .mockResolvedValueOnce({ ...mockNote, ...updateDto });

      expect(service.update(1, updateDto, mockUser)).rejects.toThrow(
        new ConflictException('Title already registered'),
      );
    });

    it('should throw not found if note is not found', () => {
      const updateDto = new UpdateNoteDto();
      updateDto.title = dto.title;

      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(null);

      expect(service.update(1, updateDto, mockUser)).rejects.toThrow(
        new NotFoundException("Note doesn't exist."),
      );
    });

    it("should throw forbidden if note doesn't belong to user", () => {
      const updateDto = new UpdateNoteDto();
      updateDto.text = dto.text;
      const mockNote = {
        ...dto,
        createdAt: new Date(),
        updatedAt: new Date(),
        id: 1,
        userId: 99,
      };
      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(mockNote);

      expect(service.update(1, updateDto, mockUser)).rejects.toThrow(
        new ForbiddenException("Note doesn't belong to user."),
      );
    });
  });

  describe('Remove service test', () => {
    it('should delete note', async () => {
      const mockNote = {
        ...dto,
        createdAt: new Date(),
        updatedAt: new Date(),
        id: 1,
        userId: 1,
      };
      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(mockNote);
      jest.spyOn(repository, 'remove').mockResolvedValueOnce(mockNote);

      const create = await service.remove(1, mockUser);
      expect(create).toEqual(true);
    });

    it('should throw not found if note is not found', () => {
      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(null);

      expect(service.remove(1, mockUser)).rejects.toThrow(
        new NotFoundException("Note doesn't exist."),
      );
    });

    it("should throw forbidden if note doesn't belong to user", () => {
      const mockNote = {
        ...dto,
        createdAt: new Date(),
        updatedAt: new Date(),
        id: 1,
        userId: 99,
      };
      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(mockNote);

      expect(service.remove(1, mockUser)).rejects.toThrow(
        new ForbiddenException("Note doesn't belong to user."),
      );
    });
  });
});
