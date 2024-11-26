import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsPositive, MinLength, IsOptional } from 'class-validator';

export class UpdateProductDto {
  @ApiProperty({ description: 'Nome do produto' })
  @IsString()
  @MinLength(3)
  @IsOptional()
  name?: string;

  @ApiProperty({ description: 'Descrição do produto' })
  @IsString()
  @MinLength(10)
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Preço do produto' })
  @IsNumber()
  @IsPositive()
  @IsOptional()
  price?: number;

  @ApiProperty({ description: 'Quantidade em estoque' })
  @IsNumber()
  @IsPositive()
  @IsOptional()
  stock?: number;
}
