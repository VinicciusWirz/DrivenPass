import { AuthGuard } from '../guards/auth.guard';
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  Put,
} from '@nestjs/common';
import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { User } from '../decorators/user.decorator';
import { User as UserPrisma } from '@prisma/client';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Notes')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Post()
  @ApiBody({ type: CreateNoteDto })
  @ApiOperation({ summary: 'Register a note' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Note registered',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Title already registered',
  })
  create(@Body() body: CreateNoteDto, @User() user: UserPrisma) {
    return this.notesService.create(body, user);
  }

  @Get()
  @ApiOperation({ summary: "List all user's notes" })
  findAll(@User() user: UserPrisma) {
    return this.notesService.findAll(user);
  }

  @Get(':id')
  @ApiOperation({ summary: "Find one user's note" })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: "Note doesn't belong to user",
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Note not found',
  })
  findOne(@Param('id', ParseIntPipe) id: number, @User() user: UserPrisma) {
    return this.notesService.findOne(id, user);
  }

  @Put(':id')
  @ApiOperation({ summary: "Updates one user's note" })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: "Note doesn't belong to user",
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Note not found',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateNoteDto,
    @User() user: UserPrisma,
  ) {
    return this.notesService.update(id, body, user);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete user's note" })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: "Note doesn't belong to user",
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Note not found',
  })
  remove(@Param('id', ParseIntPipe) id: number, @User() user: UserPrisma) {
    return this.notesService.remove(id, user);
  }
}
