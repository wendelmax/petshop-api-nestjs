import { Test, TestingModule } from '@nestjs/testing';
import { AppointmentsService } from './appointments.service';
import { PrismaService } from '../../prisma/prisma.service';
import { AppointmentStatus } from '@prisma/client';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('AppointmentsService', () => {
  let service: AppointmentsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    appointment: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    pet: {
      findFirst: jest.fn(),
    },
    service: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppointmentsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<AppointmentsService>(AppointmentsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createAppointmentDto = {
      petId: 'pet-id',
      serviceId: 'service-id',
      date: '2024-03-20T10:00:00Z',
    };
    const userId = 'user-id';

    it('should create an appointment successfully', async () => {
      const mockPet = { id: 'pet-id', ownerId: userId };
      const mockService = { id: 'service-id' };
      const mockAppointment = { id: 'appointment-id', ...createAppointmentDto };

      mockPrismaService.pet.findFirst.mockResolvedValue(mockPet);
      mockPrismaService.service.findUnique.mockResolvedValue(mockService);
      mockPrismaService.appointment.findFirst.mockResolvedValue(null);
      mockPrismaService.appointment.create.mockResolvedValue(mockAppointment);

      const result = await service.create(createAppointmentDto, userId);

      expect(result).toEqual(mockAppointment);
      expect(mockPrismaService.pet.findFirst).toHaveBeenCalled();
      expect(mockPrismaService.service.findUnique).toHaveBeenCalled();
      expect(mockPrismaService.appointment.create).toHaveBeenCalled();
    });

    it('should throw NotFoundException when pet not found', async () => {
      mockPrismaService.pet.findFirst.mockResolvedValue(null);

      await expect(service.create(createAppointmentDto, userId))
        .rejects
        .toThrow(NotFoundException);
    });

    it('should throw NotFoundException when service not found', async () => {
      const mockPet = { id: 'pet-id', ownerId: userId };
      mockPrismaService.pet.findFirst.mockResolvedValue(mockPet);
      mockPrismaService.service.findUnique.mockResolvedValue(null);

      await expect(service.create(createAppointmentDto, userId))
        .rejects
        .toThrow(NotFoundException);
    });

    it('should throw BadRequestException when timeslot is already taken', async () => {
      const mockPet = { id: 'pet-id', ownerId: userId };
      const mockService = { id: 'service-id' };
      const existingAppointment = { id: 'existing-id' };

      mockPrismaService.pet.findFirst.mockResolvedValue(mockPet);
      mockPrismaService.service.findUnique.mockResolvedValue(mockService);
      mockPrismaService.appointment.findFirst.mockResolvedValue(existingAppointment);

      await expect(service.create(createAppointmentDto, userId))
        .rejects
        .toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    const userId = 'user-id';

    it('should return all appointments for a user', async () => {
      const mockAppointments = [
        { id: '1', petId: 'pet1', serviceId: 'service1' },
        { id: '2', petId: 'pet2', serviceId: 'service2' },
      ];

      mockPrismaService.appointment.findMany.mockResolvedValue(mockAppointments);

      const result = await service.findAll(userId);

      expect(result).toEqual(mockAppointments);
      expect(mockPrismaService.appointment.findMany).toHaveBeenCalledWith({
        where: { userId },
        include: {
          pet: true,
          service: true,
        },
      });
    });
  });

  describe('update', () => {
    const appointmentId = 'appointment-id';
    const userId = 'user-id';
    const updateDto = { status: AppointmentStatus.CONFIRMED };

    it('should update appointment status successfully', async () => {
      const mockAppointment = { id: appointmentId, userId };
      const updatedAppointment = { ...mockAppointment, ...updateDto };

      mockPrismaService.appointment.findFirst.mockResolvedValue(mockAppointment);
      mockPrismaService.appointment.update.mockResolvedValue(updatedAppointment);

      const result = await service.update(appointmentId, updateDto, userId);

      expect(result).toEqual(updatedAppointment);
      expect(mockPrismaService.appointment.update).toHaveBeenCalledWith({
        where: { id: appointmentId },
        data: updateDto,
      });
    });

    it('should throw NotFoundException when appointment not found', async () => {
      mockPrismaService.appointment.findFirst.mockResolvedValue(null);

      await expect(service.update(appointmentId, updateDto, userId))
        .rejects
        .toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    const appointmentId = 'appointment-id';
    const userId = 'user-id';

    it('should delete appointment successfully', async () => {
      const mockAppointment = { id: appointmentId, userId };

      mockPrismaService.appointment.findFirst.mockResolvedValue(mockAppointment);
      mockPrismaService.appointment.delete.mockResolvedValue(mockAppointment);

      await service.remove(appointmentId, userId);

      expect(mockPrismaService.appointment.delete).toHaveBeenCalledWith({
        where: { id: appointmentId },
      });
    });

    it('should throw NotFoundException when appointment not found', async () => {
      mockPrismaService.appointment.findFirst.mockResolvedValue(null);

      await expect(service.remove(appointmentId, userId))
        .rejects
        .toThrow(NotFoundException);
    });
  });
});
