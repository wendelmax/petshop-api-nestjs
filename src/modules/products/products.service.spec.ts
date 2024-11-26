import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { PrismaService } from '../../prisma/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('ProductsService', () => {
  let service: ProductsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    product: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createProductDto = {
      name: 'Test Product',
      description: 'Test Description',
      price: 100,
      stock: 10,
    };

    it('should create a product successfully', async () => {
      const mockProduct = { id: 'product-id', ...createProductDto };
      mockPrismaService.product.findFirst.mockResolvedValue(null);
      mockPrismaService.product.create.mockResolvedValue(mockProduct);

      const result = await service.create(createProductDto);

      expect(result).toEqual(mockProduct);
      expect(mockPrismaService.product.create).toHaveBeenCalledWith({
        data: createProductDto,
      });
    });

    it('should throw BadRequestException when product name already exists', async () => {
      mockPrismaService.product.findFirst.mockResolvedValue({ id: 'existing-id' });

      await expect(service.create(createProductDto))
        .rejects
        .toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return all products', async () => {
      const mockProducts = [
        { id: '1', name: 'Product 1', price: 100, stock: 10 },
        { id: '2', name: 'Product 2', price: 200, stock: 20 },
      ];
      mockPrismaService.product.findMany.mockResolvedValue(mockProducts);

      const result = await service.findAll();

      expect(result).toEqual(mockProducts);
      expect(mockPrismaService.product.findMany).toHaveBeenCalledWith({
        orderBy: { name: 'asc' },
      });
    });
  });

  describe('findOne', () => {
    const productId = 'product-id';

    it('should return a specific product', async () => {
      const mockProduct = { id: productId, name: 'Product', price: 100, stock: 10 };
      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);

      const result = await service.findOne(productId);

      expect(result).toEqual(mockProduct);
      expect(mockPrismaService.product.findUnique).toHaveBeenCalledWith({
        where: { id: productId },
      });
    });

    it('should throw NotFoundException when product not found', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(null);

      await expect(service.findOne(productId))
        .rejects
        .toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const productId = 'product-id';
    const updateProductDto = { price: 150, stock: 15 };

    it('should update a product successfully', async () => {
      const mockProduct = { id: productId, name: 'Product', price: 100, stock: 10 };
      const updatedProduct = { ...mockProduct, ...updateProductDto };

      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);
      mockPrismaService.product.update.mockResolvedValue(updatedProduct);

      const result = await service.update(productId, updateProductDto);

      expect(result).toEqual(updatedProduct);
      expect(mockPrismaService.product.update).toHaveBeenCalledWith({
        where: { id: productId },
        data: updateProductDto,
      });
    });

    it('should throw NotFoundException when product not found', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(null);

      await expect(service.update(productId, updateProductDto))
        .rejects
        .toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    const productId = 'product-id';

    it('should delete a product successfully', async () => {
      const mockProduct = { id: productId, name: 'Product', price: 100, stock: 10 };
      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);

      await service.remove(productId);

      expect(mockPrismaService.product.delete).toHaveBeenCalledWith({
        where: { id: productId },
      });
    });

    it('should throw NotFoundException when product not found', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(null);

      await expect(service.remove(productId))
        .rejects
        .toThrow(NotFoundException);
    });
  });

  describe('stock management', () => {
    const productId = 'product-id';
    const updateStockDto = { quantity: 5 };

    describe('addStock', () => {
      it('should add stock successfully', async () => {
        const mockProduct = { id: productId, name: 'Product', price: 100, stock: 10 };
        const updatedProduct = { ...mockProduct, stock: 15 };

        mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);
        mockPrismaService.product.update.mockResolvedValue(updatedProduct);

        const result = await service.addStock(productId, updateStockDto);

        expect(result).toEqual(updatedProduct);
        expect(mockPrismaService.product.update).toHaveBeenCalledWith({
          where: { id: productId },
          data: {
            stock: {
              increment: updateStockDto.quantity,
            },
          },
        });
      });
    });

    describe('removeStock', () => {
      it('should remove stock successfully', async () => {
        const mockProduct = { id: productId, name: 'Product', price: 100, stock: 10 };
        const updatedProduct = { ...mockProduct, stock: 5 };

        mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);
        mockPrismaService.product.update.mockResolvedValue(updatedProduct);

        const result = await service.removeStock(productId, updateStockDto);

        expect(result).toEqual(updatedProduct);
        expect(mockPrismaService.product.update).toHaveBeenCalledWith({
          where: { id: productId },
          data: {
            stock: {
              decrement: updateStockDto.quantity,
            },
          },
        });
      });

      it('should throw BadRequestException when insufficient stock', async () => {
        const mockProduct = { id: productId, name: 'Product', price: 100, stock: 3 };
        mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);

        await expect(service.removeStock(productId, updateStockDto))
          .rejects
          .toThrow(BadRequestException);
      });
    });
  });
});
