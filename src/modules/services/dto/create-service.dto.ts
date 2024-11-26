import { IsString, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateServiceDto {
  @ApiProperty({ description: 'The name of the service' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Description of the service' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Price of the service' })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ description: 'Duration in minutes' })
  @IsNumber()
  @Min(1)
  duration: number;
}
