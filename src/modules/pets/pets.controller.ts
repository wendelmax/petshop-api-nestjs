import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { PetsService } from './pets.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('pets')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('pets')
export class PetsController {
  constructor(private readonly petsService: PetsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new pet' })
  @ApiResponse({ status: 201, description: 'Pet created successfully' })
  create(
    @Body()
    createPetDto: {
      name: string;
      species: string;
      breed?: string;
      birthDate?: Date;
    },
    @Request() req,
  ) {
    return this.petsService.create(createPetDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all pets' })
  @ApiResponse({ status: 200, description: 'Return all pets' })
  findAll(@Request() req) {
    return this.petsService.findAll(req.user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get pet by id' })
  @ApiResponse({ status: 200, description: 'Return the pet' })
  @ApiResponse({ status: 404, description: 'Pet not found' })
  findOne(@Param('id') id: string, @Request() req) {
    return this.petsService.findOne(id, req.user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update pet' })
  @ApiResponse({ status: 200, description: 'Pet updated successfully' })
  @ApiResponse({ status: 404, description: 'Pet not found' })
  update(
    @Param('id') id: string,
    @Body()
    updatePetDto: {
      name?: string;
      species?: string;
      breed?: string;
      birthDate?: Date;
    },
    @Request() req,
  ) {
    return this.petsService.update(id, updatePetDto, req.user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete pet' })
  @ApiResponse({ status: 200, description: 'Pet deleted successfully' })
  @ApiResponse({ status: 404, description: 'Pet not found' })
  remove(@Param('id') id: string, @Request() req) {
    return this.petsService.remove(id, req.user);
  }

  @Post(':id/health-records')
  @ApiOperation({ summary: 'Add health record to pet' })
  @ApiResponse({ status: 201, description: 'Health record added successfully' })
  @ApiResponse({ status: 404, description: 'Pet not found' })
  addHealthRecord(
    @Param('id') id: string,
    @Body()
    healthRecordDto: {
      type: string;
      description: string;
      date: Date;
    },
    @Request() req,
  ) {
    return this.petsService.addHealthRecord(id, healthRecordDto, req.user);
  }

  @Get(':id/health-records')
  @ApiOperation({ summary: 'Get pet health records' })
  @ApiResponse({ status: 200, description: 'Return pet health records' })
  @ApiResponse({ status: 404, description: 'Pet not found' })
  getHealthRecords(@Param('id') id: string, @Request() req) {
    return this.petsService.getHealthRecords(id, req.user);
  }
}
