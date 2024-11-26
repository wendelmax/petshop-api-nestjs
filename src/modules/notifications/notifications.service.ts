import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { Notification, NotificationType } from '@prisma/client';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async create(createNotificationDto: CreateNotificationDto): Promise<Notification> {
    return this.prisma.notification.create({
      data: createNotificationDto,
    });
  }

  async findAll(userId: string): Promise<Notification[]> {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findUnread(userId: string): Promise<Notification[]> {
    return this.prisma.notification.findMany({
      where: { 
        userId,
        read: false,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async markAsRead(id: string, userId: string): Promise<Notification> {
    const notification = await this.prisma.notification.findFirst({
      where: { id, userId },
    });

    if (!notification) {
      throw new NotFoundException('Notificação não encontrada');
    }

    return this.prisma.notification.update({
      where: { id },
      data: { read: true },
    });
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.prisma.notification.updateMany({
      where: { 
        userId,
        read: false,
      },
      data: { read: true },
    });
  }

  async createAppointmentReminder(
    userId: string,
    appointmentDate: Date,
    serviceName: string,
    petName: string,
  ): Promise<Notification> {
    const title = 'Lembrete de Agendamento';
    const message = `Você tem um agendamento de ${serviceName} para ${petName} amanhã às ${appointmentDate.toLocaleTimeString()}.`;

    return this.create({
      userId,
      title,
      message,
      type: NotificationType.APPOINTMENT_REMINDER,
    });
  }

  async createLowStockAlert(
    adminId: string,
    productName: string,
    currentStock: number,
  ): Promise<Notification> {
    const title = 'Alerta de Estoque Baixo';
    const message = `O produto ${productName} está com estoque baixo (${currentStock} unidades restantes).`;

    return this.create({
      userId: adminId,
      title,
      message,
      type: NotificationType.LOW_STOCK,
    });
  }

  async createAppointmentConfirmation(
    userId: string,
    appointmentDate: Date,
    serviceName: string,
    petName: string,
  ): Promise<Notification> {
    const title = 'Agendamento Confirmado';
    const message = `Seu agendamento de ${serviceName} para ${petName} foi confirmado para ${appointmentDate.toLocaleString()}.`;

    return this.create({
      userId,
      title,
      message,
      type: NotificationType.APPOINTMENT_CONFIRMATION,
    });
  }

  async createAppointmentCancellation(
    userId: string,
    serviceName: string,
    petName: string,
  ): Promise<Notification> {
    const title = 'Agendamento Cancelado';
    const message = `Seu agendamento de ${serviceName} para ${petName} foi cancelado.`;

    return this.create({
      userId,
      title,
      message,
      type: NotificationType.APPOINTMENT_CANCELLATION,
    });
  }
}
