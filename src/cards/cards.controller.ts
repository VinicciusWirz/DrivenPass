import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '../guards/auth.guard';
import { CardsService } from './cards.service';
import { CreateCardDto } from './dto/create-card.dto';
import { User as UserPrisma } from '@prisma/client';
import { User } from '../decorators/user.decorator';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Cards')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('cards')
export class CardsController {
  constructor(private readonly cardsService: CardsService) {}

  @Post()
  @ApiBody({ type: CreateCardDto })
  @ApiOperation({ summary: 'Register a card' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Card registered' })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Title already registered',
  })
  create(@Body() createCardDto: CreateCardDto, @User() user: UserPrisma) {
    return this.cardsService.create(createCardDto, user);
  }

  @Get()
  @ApiOperation({ summary: "List all user's cards" })
  findAll(@User() user: UserPrisma) {
    return this.cardsService.findAll(user);
  }

  @Get(':id')
  @ApiOperation({ summary: "Find one user's card" })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: "Card doesn't belong to user",
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Card not found',
  })
  findOne(@Param('id') id: string) {
    return this.cardsService.findOne(+id);
  }

  @Delete(':id')
  @ApiOperation({ summary: "Delete user's card" })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: "Card doesn't belong to user",
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Card not found',
  })
  remove(@Param('id') id: string) {
    return this.cardsService.remove(+id);
  }
}
