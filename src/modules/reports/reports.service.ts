import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { GenerateReportDto, ReportType } from './dto/generate-report.dto';
import { AppointmentStatus } from '@prisma/client';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async generateReport(generateReportDto: GenerateReportDto) {
    const { type, startDate, endDate, ...filters } = generateReportDto;
    const dateRange = {
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    };

    switch (type) {
      case ReportType.APPOINTMENTS:
        return this.generateAppointmentsReport(dateRange, filters);
      case ReportType.PRODUCTS:
        return this.generateProductsReport(dateRange, filters);
      case ReportType.REVENUE:
        return this.generateRevenueReport(dateRange, filters);
    }
  }

  private async generateAppointmentsReport(dateRange: { startDate: Date; endDate: Date }, filters: any) {
    const appointments = await this.prisma.appointment.findMany({
      where: {
        date: {
          gte: dateRange.startDate,
          lte: dateRange.endDate,
        },
        ...(filters.serviceId && { serviceId: filters.serviceId }),
      },
      include: {
        pet: true,
        service: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: { date: 'asc' },
    });

    const summary = {
      total: appointments.length,
      byStatus: {
        scheduled: appointments.filter(a => a.status === AppointmentStatus.SCHEDULED).length,
        confirmed: appointments.filter(a => a.status === AppointmentStatus.CONFIRMED).length,
        completed: appointments.filter(a => a.status === AppointmentStatus.COMPLETED).length,
        cancelled: appointments.filter(a => a.status === AppointmentStatus.CANCELLED).length,
      },
    };

    return {
      type: ReportType.APPOINTMENTS,
      period: { startDate: dateRange.startDate, endDate: dateRange.endDate },
      summary,
      details: appointments,
    };
  }

  private async generateProductsReport(dateRange: { startDate: Date; endDate: Date }, filters: any) {
    const products = await this.prisma.product.findMany({
      where: filters.lowStock ? { stock: { lte: 10 } } : {},
      orderBy: [
        { stock: 'asc' },
        { name: 'asc' },
      ],
    });

    const summary = {
      total: products.length,
      lowStock: products.filter(p => p.stock <= 10).length,
      outOfStock: products.filter(p => p.stock === 0).length,
      totalValue: products.reduce((sum, p) => sum + (p.price * p.stock), 0),
    };

    return {
      type: ReportType.PRODUCTS,
      period: { startDate: dateRange.startDate, endDate: dateRange.endDate },
      summary,
      details: products,
    };
  }

  private async generateRevenueReport(dateRange: { startDate: Date; endDate: Date }, filters: any) {
    const appointments = await this.prisma.appointment.findMany({
      where: {
        date: {
          gte: dateRange.startDate,
          lte: dateRange.endDate,
        },
        status: AppointmentStatus.COMPLETED,
        ...(filters.serviceId && { serviceId: filters.serviceId }),
      },
      include: {
        service: true,
      },
    });

    const revenueByService = appointments.reduce((acc, appointment) => {
      const serviceName = appointment.service.name;
      if (!acc[serviceName]) {
        acc[serviceName] = {
          count: 0,
          revenue: 0,
        };
      }
      acc[serviceName].count++;
      acc[serviceName].revenue += appointment.service.price;
      return acc;
    }, {} as Record<string, { count: number; revenue: number }>);

    const totalRevenue = appointments.reduce((sum, a) => sum + a.service.price, 0);

    return {
      type: ReportType.REVENUE,
      period: { startDate: dateRange.startDate, endDate: dateRange.endDate },
      summary: {
        totalRevenue,
        totalAppointments: appointments.length,
        averageTicket: totalRevenue / (appointments.length || 1),
      },
      revenueByService,
      details: appointments,
    };
  }
}
