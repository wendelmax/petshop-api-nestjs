import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsPositive } from 'class-validator';

export class UpdateStockDto {
  @ApiProperty({ description: 'Quantidade a ser adicionada ou removida do estoque' })
  @IsNumber()
  @IsPositive()
  quantity: number;
}
