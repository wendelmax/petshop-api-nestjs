import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsPositive, MinLength } from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ description: 'Nome do produto' })
  @IsString()
  @MinLength(3)
  name: string;

  @ApiProperty({ description: 'Descrição do produto' })
  @IsString()
  @MinLength(10)
  description: string;

  @ApiProperty({ description: 'Preço do produto' })
  @IsNumber()
  @IsPositive()
  price: number;

  @ApiProperty({ description: 'Quantidade em estoque' })
  @IsNumber()
  @IsPositive()
  stock: number;
}
