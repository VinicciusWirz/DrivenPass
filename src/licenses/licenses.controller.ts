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
import { LicensesService } from './licenses.service';
import { CreateLicenseDto } from './dto/create-license.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '../guards/auth.guard';
import { User as UserPrisma } from '@prisma/client';
import { User } from '../decorators/user.decorator';

@ApiTags('Credentials')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('licenses')
export class LicensesController {
  constructor(private readonly licensesService: LicensesService) {}

  @Post()
  @ApiBody({ type: CreateLicenseDto })
  @ApiOperation({ summary: 'Register a software license' })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'License already registered for this software',
  })
  create(@Body() body: CreateLicenseDto, @User() user: UserPrisma) {
    return this.licensesService.create(body, user);
  }

  @Get()
  findAll() {
    return this.licensesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.licensesService.findOne(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.licensesService.remove(+id);
  }
}
