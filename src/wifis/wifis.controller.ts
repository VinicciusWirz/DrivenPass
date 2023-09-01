import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import { WifisService } from './wifis.service';
import { CreateWifiDto } from './dto/create-wifi.dto';
import { AuthGuard } from '../guards/auth.guard';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { User as UserPrisma } from '@prisma/client';
import { User } from '../decorators/user.decorator';

@ApiTags('Wifis')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('wifis')
export class WifisController {
  constructor(private readonly wifisService: WifisService) {}

  @Post()
  @ApiBody({ type: CreateWifiDto })
  @ApiOperation({ summary: 'Register a wifi' })
  create(@Body() createWifiDto: CreateWifiDto, @User() user: UserPrisma) {
    return this.wifisService.create(createWifiDto, user);
  }

  @Get()
  @ApiOperation({ summary: "List all user's wifis" })
  findAll(@User() user: UserPrisma) {
    return this.wifisService.findAll(user);
  }

  @Get(':id')
  @ApiOperation({ summary: "Find one user's wifi" })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: "Wifi register doesn't belong to user",
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Wifi register not found',
  })
  findOne(@Param('id', ParseIntPipe) id: number, @User() user: UserPrisma) {
    return this.wifisService.findOne(id, user);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.wifisService.remove(+id);
  }
}
