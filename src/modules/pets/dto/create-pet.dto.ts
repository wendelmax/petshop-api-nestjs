import { IsString, IsOptional, IsDate } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePetDto {
  @ApiProperty({ description: 'The name of the pet' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'The species of the pet' })
  @IsString()
  species: string;

  @ApiProperty({ description: 'The breed of the pet', required: false })
  @IsString()
  @IsOptional()
  breed?: string;

  @ApiProperty({ description: 'The birth date of the pet', required: false })
  @IsDate()
  @IsOptional()
  birthDate?: Date;
}
