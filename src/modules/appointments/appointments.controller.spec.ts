import { Test, TestingModule } from '@nestjs/testing';
import { AppointmentsController } from './appointments.controller';
import { AppointmentsService } from './appointments.service';
import { AppointmentStatus } from '@prisma/client';

describe('AppointmentsController', () => {
  let controller: AppointmentsController;
  let service: AppointmentsService;

  const mockAppointmentsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppointmentsController],
      providers: [
        {
          provide: AppointmentsService,
          useValue: mockAppointmentsService,
        },
      ],
    }).compile();

    controller = module.get<AppointmentsController>(AppointmentsController);
    service = module.get<AppointmentsService>(AppointmentsService);
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

    it('should create an appointment', async () => {
      const mockAppointment = { id: 'appointment-id', ...createAppointmentDto };
      mockAppointmentsService.create.mockResolvedValue(mockAppointment);

      const result = await controller.create(createAppointmentDto, userId);

      expect(result).toBe(mockAppointment);
      expect(mockAppointmentsService.create).toHaveBeenCalledWith(createAppointmentDto, userId);
    });
  });

  describe('findAll', () => {
    const userId = 'user-id';

    it('should return all appointments for a user', async () => {
      const mockAppointments = [
        { id: '1', petId: 'pet1', serviceId: 'service1' },
        { id: '2', petId: 'pet2', serviceId: 'service2' },
      ];
      mockAppointmentsService.findAll.mockResolvedValue(mockAppointments);

      const result = await controller.findAll(userId);

      expect(result).toBe(mockAppointments);
      expect(mockAppointmentsService.findAll).toHaveBeenCalledWith(userId);
    });
  });

  describe('findOne', () => {
    const appointmentId = 'appointment-id';
    const userId = 'user-id';

    it('should return a specific appointment', async () => {
      const mockAppointment = { id: appointmentId, petId: 'pet1', serviceId: 'service1' };
      mockAppointmentsService.findOne.mockResolvedValue(mockAppointment);

      const result = await controller.findOne(appointmentId, userId);

      expect(result).toBe(mockAppointment);
      expect(mockAppointmentsService.findOne).toHaveBeenCalledWith(appointmentId, userId);
    });
  });

  describe('update', () => {
    const appointmentId = 'appointment-id';
    const userId = 'user-id';
    const updateDto = { status: AppointmentStatus.CONFIRMED };

    it('should update an appointment', async () => {
      const mockAppointment = { id: appointmentId, ...updateDto };
      mockAppointmentsService.update.mockResolvedValue(mockAppointment);

      const result = await controller.update(appointmentId, updateDto, userId);

      expect(result).toBe(mockAppointment);
      expect(mockAppointmentsService.update).toHaveBeenCalledWith(appointmentId, updateDto, userId);
    });
  });

  describe('remove', () => {
    const appointmentId = 'appointment-id';
    const userId = 'user-id';

    it('should remove an appointment', async () => {
      await controller.remove(appointmentId, userId);

      expect(mockAppointmentsService.remove).toHaveBeenCalledWith(appointmentId, userId);
    });
  });
});
