import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  HttpStatus,
  ParseIntPipe,
  HttpCode,
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

@ApiTags('Licenses')
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
  @ApiOperation({ summary: "List all user's licenses" })
  findAll(@User() user: UserPrisma) {
    return this.licensesService.findAll(user);
  }

  @Get(':id')
  @ApiOperation({ summary: "Find one user's license" })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: "License register doesn't belong to user",
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'License register not found',
  })
  findOne(@Param('id', ParseIntPipe) id: number, @User() user: UserPrisma) {
    return this.licensesService.findOne(id, user);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete user's software license register" })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: "License register doesn't belong to user",
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'License register not found',
  })
  remove(@Param('id', ParseIntPipe) id: number, @User() user: UserPrisma) {
    return this.licensesService.remove(id, user);
  }
}
