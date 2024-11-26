import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { UpdateStockDto } from './dto/update-stock.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('products')
@Controller('products')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @Roles(Role.ADMIN, Role.EMPLOYEE)
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.EMPLOYEE, Role.CLIENT)
  findAll() {
    return this.productsService.findAll();
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.EMPLOYEE, Role.CLIENT)
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.EMPLOYEE)
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }

  @Patch(':id/add-stock')
  @Roles(Role.ADMIN, Role.EMPLOYEE)
  addStock(@Param('id') id: string, @Body() updateStockDto: UpdateStockDto) {
    return this.productsService.addStock(id, updateStockDto);
  }

  @Patch(':id/remove-stock')
  @Roles(Role.ADMIN, Role.EMPLOYEE)
  removeStock(@Param('id') id: string, @Body() updateStockDto: UpdateStockDto) {
    return this.productsService.removeStock(id, updateStockDto);
  }
}
