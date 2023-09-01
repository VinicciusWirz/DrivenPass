import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { WifisService } from './wifis.service';
import { CreateWifiDto } from './dto/create-wifi.dto';
import { AuthGuard } from '../guards/auth.guard';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
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
  findOne(@Param('id') id: string) {
    return this.wifisService.findOne(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.wifisService.remove(+id);
  }
}
