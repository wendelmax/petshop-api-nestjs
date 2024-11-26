import { IsString, IsDate } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateHealthRecordDto {
  @ApiProperty({ description: 'The type of health record (e.g., vaccination, checkup)' })
  @IsString()
  type: string;

  @ApiProperty({ description: 'Detailed description of the health record' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'The date of the health record' })
  @IsDate()
  date: Date;
}
