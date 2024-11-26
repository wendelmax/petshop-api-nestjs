import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional, IsUUID } from 'class-validator';

export enum ReportType {
  APPOINTMENTS = 'appointments',
  PRODUCTS = 'products',
  REVENUE = 'revenue',
}

export class GenerateReportDto {
  @ApiProperty({
    enum: ReportType,
    description: 'Tipo do relatório',
  })
  @IsEnum(ReportType)
  type: ReportType;

  @ApiProperty({ description: 'Data inicial do período' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ description: 'Data final do período' })
  @IsDateString()
  endDate: string;

  @ApiProperty({ description: 'ID do serviço (opcional)', required: false })
  @IsUUID()
  @IsOptional()
  serviceId?: string;

  @ApiProperty({ description: 'Filtrar produtos com estoque baixo', required: false })
  @IsOptional()
  lowStock?: boolean;
}
