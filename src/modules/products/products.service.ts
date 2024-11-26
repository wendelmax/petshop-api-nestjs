import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { UpdateStockDto } from './dto/update-stock.dto';
import { Product } from '@prisma/client';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    try {
      return await this.prisma.product.create({
        data: createProductDto,
      });
    } catch (error) {
      if (error.code === 'P2002' && error.meta?.target?.includes('name')) {
        throw new BadRequestException('Já existe um produto com este nome');
      }
      throw error;
    }
  }

  async findAll(): Promise<Product[]> {
    return this.prisma.product.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException('Produto não encontrado');
    }

    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
    try {
      return await this.prisma.product.update({
        where: { id },
        data: updateProductDto,
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Produto não encontrado');
      }
      if (error.code === 'P2002' && error.meta?.target?.includes('name')) {
        throw new BadRequestException('Já existe um produto com este nome');
      }
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException('Produto não encontrado');
    }

    await this.prisma.product.delete({
      where: { id },
    });
  }

  async addStock(id: string, updateStockDto: UpdateStockDto): Promise<Product> {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException('Produto não encontrado');
    }

    return this.prisma.product.update({
      where: { id },
      data: {
        stock: {
          increment: updateStockDto.quantity,
        },
      },
    });
  }

  async removeStock(id: string, updateStockDto: UpdateStockDto): Promise<Product> {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException('Produto não encontrado');
    }

    if (product.stock < updateStockDto.quantity) {
      throw new BadRequestException('Estoque insuficiente');
    }

    return this.prisma.product.update({
      where: { id },
      data: {
        stock: {
          decrement: updateStockDto.quantity,
        },
      },
    });
  }
}
