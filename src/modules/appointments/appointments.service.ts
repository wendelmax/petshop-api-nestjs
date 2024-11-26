import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { Appointment, AppointmentStatus } from '@prisma/client';

@Injectable()
export class AppointmentsService {
  constructor(private prisma: PrismaService) {}

  async create(createAppointmentDto: CreateAppointmentDto, userId: string): Promise<Appointment> {
    // Verificar se o pet existe e pertence ao usuário
    const pet = await this.prisma.pet.findFirst({
      where: {
        id: createAppointmentDto.petId,
        ownerId: userId,
      },
    });

    if (!pet) {
      throw new NotFoundException('Pet não encontrado ou não pertence ao usuário');
    }

    // Verificar se o serviço existe
    const service = await this.prisma.service.findUnique({
      where: { id: createAppointmentDto.serviceId },
    });

    if (!service) {
      throw new NotFoundException('Serviço não encontrado');
    }

    // Verificar se já existe agendamento no mesmo horário
    const existingAppointment = await this.prisma.appointment.findFirst({
      where: {
        date: new Date(createAppointmentDto.date),
        status: {
          in: [AppointmentStatus.SCHEDULED, AppointmentStatus.CONFIRMED],
        },
      },
    });

    if (existingAppointment) {
      throw new BadRequestException('Já existe um agendamento neste horário');
    }

    return this.prisma.appointment.create({
      data: {
        petId: createAppointmentDto.petId,
        serviceId: createAppointmentDto.serviceId,
        userId,
        date: new Date(createAppointmentDto.date),
      },
    });
  }

  async findAll(userId: string): Promise<Appointment[]> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (user.role === 'ADMIN' || user.role === 'EMPLOYEE') {
      return this.prisma.appointment.findMany({
        include: {
          pet: true,
          service: true,
          user: true,
        },
      });
    }

    return this.prisma.appointment.findMany({
      where: { userId },
      include: {
        pet: true,
        service: true,
      },
    });
  }

  async findOne(id: string, userId: string): Promise<Appointment> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    const appointment = await this.prisma.appointment.findFirst({
      where: user.role === 'ADMIN' || user.role === 'EMPLOYEE' ? { id } : { id, userId },
      include: {
        pet: true,
        service: true,
        user: user.role === 'ADMIN' || user.role === 'EMPLOYEE' ? true : false,
      },
    });

    if (!appointment) {
      throw new NotFoundException('Agendamento não encontrado');
    }

    return appointment;
  }

  async update(id: string, updateAppointmentDto: UpdateAppointmentDto, userId: string): Promise<Appointment> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    const appointment = await this.prisma.appointment.findFirst({
      where: { id },
    });

    if (!appointment) {
      throw new NotFoundException('Agendamento não encontrado');
    }

    return this.prisma.appointment.update({
      where: { id },
      data: updateAppointmentDto,
      include: {
        pet: true,
        service: true,
        user: true,
      },
    });
  }

  async remove(id: string, userId: string): Promise<void> {
    const appointment = await this.prisma.appointment.findFirst({
      where: { id },
    });

    if (!appointment) {
      throw new NotFoundException('Agendamento não encontrado');
    }

    await this.prisma.appointment.delete({
      where: { id },
    });
  }
}
