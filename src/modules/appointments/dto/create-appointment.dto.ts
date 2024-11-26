import { IsDateString, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAppointmentDto {
  @ApiProperty({ description: 'ID do pet' })
  @IsUUID()
  petId: string;

  @ApiProperty({ description: 'ID do serviço' })
  @IsUUID()
  serviceId: string;

  @ApiProperty({ description: 'Data e hora do agendamento', example: '2024-03-20T10:00:00Z' })
  @IsDateString()
  date: string;
}
