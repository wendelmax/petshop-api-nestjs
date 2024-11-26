import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsUUID } from 'class-validator';
import { NotificationType } from '@prisma/client';

export class CreateNotificationDto {
  @ApiProperty({ description: 'ID do usuário que receberá a notificação' })
  @IsUUID()
  userId: string;

  @ApiProperty({ description: 'Título da notificação' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Mensagem da notificação' })
  @IsString()
  message: string;

  @ApiProperty({
    description: 'Tipo da notificação',
    enum: NotificationType,
  })
  @IsEnum(NotificationType)
  type: NotificationType;
}
