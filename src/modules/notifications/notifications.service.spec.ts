import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from './notifications.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationType } from '@prisma/client';
import { NotFoundException } from '@nestjs/common';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    notification: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createNotificationDto = {
      userId: 'user-id',
      title: 'Test Notification',
      message: 'Test Message',
      type: NotificationType.GENERAL,
    };

    it('should create a notification successfully', async () => {
      const mockNotification = { id: 'notification-id', ...createNotificationDto };
      mockPrismaService.notification.create.mockResolvedValue(mockNotification);

      const result = await service.create(createNotificationDto);

      expect(result).toEqual(mockNotification);
      expect(mockPrismaService.notification.create).toHaveBeenCalledWith({
        data: createNotificationDto,
      });
    });
  });

  describe('findAll', () => {
    const userId = 'user-id';

    it('should return all notifications for a user', async () => {
      const mockNotifications = [
        { id: '1', title: 'Notification 1', read: false },
        { id: '2', title: 'Notification 2', read: true },
      ];
      mockPrismaService.notification.findMany.mockResolvedValue(mockNotifications);

      const result = await service.findAll(userId);

      expect(result).toEqual(mockNotifications);
      expect(mockPrismaService.notification.findMany).toHaveBeenCalledWith({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('findUnread', () => {
    const userId = 'user-id';

    it('should return unread notifications for a user', async () => {
      const mockNotifications = [
        { id: '1', title: 'Notification 1', read: false },
      ];
      mockPrismaService.notification.findMany.mockResolvedValue(mockNotifications);

      const result = await service.findUnread(userId);

      expect(result).toEqual(mockNotifications);
      expect(mockPrismaService.notification.findMany).toHaveBeenCalledWith({
        where: { 
          userId,
          read: false,
        },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('markAsRead', () => {
    const notificationId = 'notification-id';
    const userId = 'user-id';

    it('should mark notification as read', async () => {
      const mockNotification = { id: notificationId, userId, read: false };
      const updatedNotification = { ...mockNotification, read: true };

      mockPrismaService.notification.findFirst.mockResolvedValue(mockNotification);
      mockPrismaService.notification.update.mockResolvedValue(updatedNotification);

      const result = await service.markAsRead(notificationId, userId);

      expect(result).toEqual(updatedNotification);
      expect(mockPrismaService.notification.update).toHaveBeenCalledWith({
        where: { id: notificationId },
        data: { read: true },
      });
    });

    it('should throw NotFoundException when notification not found', async () => {
      mockPrismaService.notification.findFirst.mockResolvedValue(null);

      await expect(service.markAsRead(notificationId, userId))
        .rejects
        .toThrow(NotFoundException);
    });
  });

  describe('markAllAsRead', () => {
    const userId = 'user-id';

    it('should mark all notifications as read', async () => {
      mockPrismaService.notification.updateMany.mockResolvedValue({ count: 2 });

      await service.markAllAsRead(userId);

      expect(mockPrismaService.notification.updateMany).toHaveBeenCalledWith({
        where: { 
          userId,
          read: false,
        },
        data: { read: true },
      });
    });
  });

  describe('createAppointmentReminder', () => {
    it('should create appointment reminder notification', async () => {
      const userId = 'user-id';
      const appointmentDate = new Date('2024-03-20T10:00:00Z');
      const serviceName = 'Test Service';
      const petName = 'Test Pet';

      const expectedNotification = {
        id: 'notification-id',
        userId,
        title: 'Lembrete de Agendamento',
        message: expect.stringContaining(serviceName),
        type: NotificationType.APPOINTMENT_REMINDER,
      };

      mockPrismaService.notification.create.mockResolvedValue(expectedNotification);

      const result = await service.createAppointmentReminder(
        userId,
        appointmentDate,
        serviceName,
        petName,
      );

      expect(result).toEqual(expectedNotification);
      expect(mockPrismaService.notification.create).toHaveBeenCalled();
    });
  });

  describe('createLowStockAlert', () => {
    it('should create low stock alert notification', async () => {
      const adminId = 'admin-id';
      const productName = 'Test Product';
      const currentStock = 5;

      const expectedNotification = {
        id: 'notification-id',
        userId: adminId,
        title: 'Alerta de Estoque Baixo',
        message: expect.stringContaining(productName),
        type: NotificationType.LOW_STOCK,
      };

      mockPrismaService.notification.create.mockResolvedValue(expectedNotification);

      const result = await service.createLowStockAlert(
        adminId,
        productName,
        currentStock,
      );

      expect(result).toEqual(expectedNotification);
      expect(mockPrismaService.notification.create).toHaveBeenCalled();
    });
  });
});
