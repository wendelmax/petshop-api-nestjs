import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { Role } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';

describe('ProductsController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;

  // Tokens para diferentes tipos de usuários
  let clientToken: string;
  let employeeToken: string;
  let adminToken: string;

  // ID para testes
  let productId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);
    jwtService = app.get<JwtService>(JwtService);

    // Clean up any existing test data
    await prisma.product.deleteMany();
    await prisma.user.deleteMany({
      where: {
        email: {
          contains: 'products-test'
        }
      }
    });

    // Create users with unique emails
    const client = await prisma.user.create({
      data: {
        email: `products-test-client-${Date.now()}@test.com`,
        password: 'password123',
        name: 'Test Client',
        role: Role.CLIENT,
      },
    });

    const employee = await prisma.user.create({
      data: {
        email: `products-test-employee-${Date.now()}@test.com`,
        password: 'password123',
        name: 'Test Employee',
        role: Role.EMPLOYEE,
      },
    });

    const admin = await prisma.user.create({
      data: {
        email: `products-test-admin-${Date.now()}@test.com`,
        password: 'password123',
        name: 'Test Admin',
        role: Role.ADMIN,
      },
    });

    // Create tokens JWT
    clientToken = jwtService.sign({ id: client.id, email: client.email, role: client.role });
    employeeToken = jwtService.sign({ id: employee.id, email: employee.email, role: employee.role });
    adminToken = jwtService.sign({ id: admin.id, email: admin.email, role: admin.role });
  });

  afterAll(async () => {
    // Clean up in correct order
    await prisma.product.deleteMany();
    await prisma.user.deleteMany({
      where: {
        email: {
          contains: 'products-test'
        }
      }
    });
    await app.close();
  });

  describe('/products (POST)', () => {
    let productName: string;
    let createdProduct: any;

    beforeEach(() => {
      productName = `Test Product ${Date.now()}`;
    });

    it('should create product as employee', async () => {
      const response = await request(app.getHttpServer())
        .post('/products')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({
          name: productName,
          description: 'Test Description',
          price: 100,
          stock: 10,
        });

      expect(response.status).toBe(201);
      createdProduct = response.body;
      productId = response.body.id;
      expect(response.body.name).toBe(productName);
      expect(response.body.price).toBe(100);
      expect(response.body.stock).toBe(10);
    });

    it('should not create product with duplicate name', async () => {
      // Ensure we have a product first
      expect(createdProduct).toBeDefined();
      
      const response = await request(app.getHttpServer())
        .post('/products')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({
          name: createdProduct.name, // Use the exact same name from the created product
          description: 'Another Description',
          price: 150,
          stock: 20,
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Já existe um produto com este nome');
    });

    it('should not create product without authentication', () => {
      return request(app.getHttpServer())
        .post('/products')
        .send({
          name: `New Product ${Date.now()}`,
          description: 'Description',
          price: 100,
          stock: 10,
        })
        .expect(401);
    });

    it('should not create product as client', () => {
      return request(app.getHttpServer())
        .post('/products')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          name: `New Product ${Date.now()}`,
          description: 'Description',
          price: 100,
          stock: 10,
        })
        .expect(403);
    });
  });

  describe('/products (GET)', () => {
    it('should get all products', () => {
      return request(app.getHttpServer())
        .get('/products')
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(200)
        .expect(res => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
          expect(res.body[0]).toHaveProperty('name');
          expect(res.body[0]).toHaveProperty('price');
          expect(res.body[0]).toHaveProperty('stock');
        });
    });
  });

  describe('/products/:id (GET)', () => {
    it('should get specific product', () => {
      return request(app.getHttpServer())
        .get(`/products/${productId}`)
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(200)
        .expect(res => {
          expect(res.body.id).toBe(productId);
        });
    });

    it('should not get non-existent product', () => {
      return request(app.getHttpServer())
        .get('/products/non-existent-id')
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(404);
    });
  });

  describe('/products/:id (PATCH)', () => {
    it('should update product as employee', () => {
      return request(app.getHttpServer())
        .patch(`/products/${productId}`)
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({
          price: 150,
          description: 'Updated Description',
        })
        .expect(200)
        .expect(res => {
          expect(res.body.price).toBe(150);
          expect(res.body.description).toBe('Updated Description');
        });
    });

    it('should not update product as client', () => {
      return request(app.getHttpServer())
        .patch(`/products/${productId}`)
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          price: 200,
        })
        .expect(403);
    });
  });

  describe('/products/:id/add-stock (PATCH)', () => {
    it('should add stock as employee', () => {
      return request(app.getHttpServer())
        .patch(`/products/${productId}/add-stock`)
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({
          quantity: 5,
        })
        .expect(200)
        .expect(res => {
          expect(res.body.stock).toBe(15);
        });
    });
  });

  describe('/products/:id/remove-stock (PATCH)', () => {
    it('should remove stock as employee', () => {
      return request(app.getHttpServer())
        .patch(`/products/${productId}/remove-stock`)
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({
          quantity: 3,
        })
        .expect(200)
        .expect(res => {
          expect(res.body.stock).toBe(12);
        });
    });

    it('should not remove stock when insufficient', () => {
      return request(app.getHttpServer())
        .patch(`/products/${productId}/remove-stock`)
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({
          quantity: 20,
        })
        .expect(400);
    });
  });

  describe('/products/:id (DELETE)', () => {
    it('should not delete product as employee', () => {
      return request(app.getHttpServer())
        .delete(`/products/${productId}`)
        .set('Authorization', `Bearer ${employeeToken}`)
        .expect(403);
    });

    it('should delete product as admin', () => {
      return request(app.getHttpServer())
        .delete(`/products/${productId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });

    it('should not find deleted product', () => {
      return request(app.getHttpServer())
        .get(`/products/${productId}`)
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(404);
    });
  });
});
