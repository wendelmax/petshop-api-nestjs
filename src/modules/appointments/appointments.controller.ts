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
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { GetUser } from '../../common/decorators/get-user.decorator';

@ApiTags('appointments')
@Controller('appointments')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post()
  @Roles(Role.CLIENT)
  create(@Body() createAppointmentDto: CreateAppointmentDto, @GetUser('id') userId: string) {
    return this.appointmentsService.create(createAppointmentDto, userId);
  }

  @Get()
  @Roles(Role.CLIENT, Role.ADMIN, Role.EMPLOYEE)
  findAll(@GetUser('id') userId: string) {
    return this.appointmentsService.findAll(userId);
  }

  @Get(':id')
  @Roles(Role.CLIENT, Role.ADMIN, Role.EMPLOYEE)
  findOne(@Param('id') id: string, @GetUser('id') userId: string) {
    return this.appointmentsService.findOne(id, userId);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.EMPLOYEE)
  update(
    @Param('id') id: string,
    @Body() updateAppointmentDto: UpdateAppointmentDto,
    @GetUser('id') userId: string,
  ) {
    return this.appointmentsService.update(id, updateAppointmentDto, userId);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string, @GetUser('id') userId: string) {
    return this.appointmentsService.remove(id, userId);
  }
}
