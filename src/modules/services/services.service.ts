import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { User, Role } from '@prisma/client';

@Injectable()
export class ServicesService {
  constructor(private prisma: PrismaService) {}

  async create(createServiceDto: CreateServiceDto, user: User) {
    if (user.role !== Role.ADMIN && user.role !== Role.EMPLOYEE) {
      throw new ForbiddenException('Only admins and employees can create services');
    }

    return this.prisma.service.create({
      data: {
        name: createServiceDto.name,
        description: createServiceDto.description,
        price: createServiceDto.price,
        duration: createServiceDto.duration,
      },
    });
  }

  async findAll() {
    return this.prisma.service.findMany({
      orderBy: {
        name: 'asc',
      },
    });
  }

  async findOne(id: string) {
    const service = await this.prisma.service.findUnique({
      where: { id },
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    return service;
  }

  async update(id: string, updateServiceDto: UpdateServiceDto, user: User) {
    if (user.role !== Role.ADMIN && user.role !== Role.EMPLOYEE) {
      throw new ForbiddenException('Only admins and employees can update services');
    }

    const service = await this.prisma.service.findUnique({
      where: { id },
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    return this.prisma.service.update({
      where: { id },
      data: updateServiceDto,
    });
  }

  async remove(id: string, user: User) {
    if (user.role !== Role.ADMIN) {
      throw new ForbiddenException('Only admins can delete services');
    }

    const service = await this.prisma.service.findUnique({
      where: { id },
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    // Check if service is being used in any appointments
    const appointmentsCount = await this.prisma.appointment.count({
      where: { serviceId: id },
    });

    if (appointmentsCount > 0) {
      throw new BadRequestException('Cannot delete service that has appointments');
    }

    await this.prisma.service.delete({
      where: { id },
    });
  }
}
