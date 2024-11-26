import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { Role, AppointmentStatus } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';

describe('AppointmentsController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;

  // Tokens para diferentes tipos de usuários
  let clientToken: string;
  let employeeToken: string;
  let adminToken: string;

  // IDs para testes
  let userId: string;
  let petId: string;
  let serviceId: string;
  let appointmentId: string;

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
    await prisma.appointment.deleteMany();
    await prisma.pet.deleteMany();
    await prisma.service.deleteMany();
    await prisma.user.deleteMany({
      where: {
        email: {
          contains: 'appointments-test'
        }
      }
    });

    // Create test data with unique emails
    const client = await prisma.user.create({
      data: {
        email: `appointments-test-client-${Date.now()}@test.com`,
        password: 'password123',
        name: 'Test Client',
        role: Role.CLIENT,
      },
    });
    userId = client.id;

    const employee = await prisma.user.create({
      data: {
        email: `appointments-test-employee-${Date.now()}@test.com`,
        password: 'password123',
        name: 'Test Employee',
        role: Role.EMPLOYEE,
      },
    });

    const admin = await prisma.user.create({
      data: {
        email: `appointments-test-admin-${Date.now()}@test.com`,
        password: 'password123',
        name: 'Test Admin',
        role: Role.ADMIN,
      },
    });

    // Create tokens JWT
    clientToken = jwtService.sign({ id: client.id, email: client.email, role: client.role });
    employeeToken = jwtService.sign({ id: employee.id, email: employee.email, role: employee.role });
    adminToken = jwtService.sign({ id: admin.id, email: admin.email, role: admin.role });

    // Create pet for tests
    const pet = await prisma.pet.create({
      data: {
        name: 'Test Pet',
        species: 'Dog',
        breed: 'Test Breed',
        birthDate: new Date(),
        ownerId: userId,
      },
    });
    petId = pet.id;

    // Create service for tests
    const service = await prisma.service.create({
      data: {
        name: 'Test Service',
        description: 'Test Description',
        price: 100,
        duration: 60,
      },
    });
    serviceId = service.id;

    // Create initial appointment for update and delete tests
    const appointment = await prisma.appointment.create({
      data: {
        petId,
        serviceId,
        userId,
        date: new Date('2024-03-20T10:00:00Z'),
        status: AppointmentStatus.SCHEDULED,
      },
    });
    appointmentId = appointment.id;
  });

  afterAll(async () => {
    // Clean up in correct order
    await prisma.appointment.deleteMany();
    await prisma.pet.deleteMany();
    await prisma.service.deleteMany();
    await prisma.user.deleteMany({
      where: {
        email: {
          contains: 'appointments-test'
        }
      }
    });
    await app.close();
  });

  describe('/appointments (POST)', () => {
    it('should create appointment as client', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      futureDate.setHours(10, 0, 0, 0);

      return request(app.getHttpServer())
        .post('/appointments')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          petId,
          serviceId,
          date: futureDate.toISOString(),
        })
        .expect(201)
        .expect(res => {
          expect(res.body.petId).toBe(petId);
          expect(res.body.serviceId).toBe(serviceId);
          expect(res.body.status).toBe(AppointmentStatus.SCHEDULED);
        });
    });

    it('should not create appointment with invalid pet', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      futureDate.setHours(10, 0, 0, 0);

      return request(app.getHttpServer())
        .post('/appointments')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          petId: '00000000-0000-0000-0000-000000000000',
          serviceId,
          date: futureDate.toISOString(),
        })
        .expect(404);
    });

    it('should not create appointment without authentication', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      futureDate.setHours(10, 0, 0, 0);

      return request(app.getHttpServer())
        .post('/appointments')
        .send({
          petId,
          serviceId,
          date: futureDate.toISOString(),
        })
        .expect(401);
    });
  });

  describe('/appointments (GET)', () => {
    it('should get all appointments as client', () => {
      return request(app.getHttpServer())
        .get('/appointments')
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(200)
        .expect(res => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
        });
    });

    it('should get appointments as employee', () => {
      return request(app.getHttpServer())
        .get('/appointments')
        .set('Authorization', `Bearer ${employeeToken}`)
        .expect(200);
    });
  });

  describe('/appointments/:id (GET)', () => {
    it('should get specific appointment', () => {
      return request(app.getHttpServer())
        .get(`/appointments/${appointmentId}`)
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(200)
        .expect(res => {
          expect(res.body.id).toBe(appointmentId);
        });
    });

    it('should not get non-existent appointment', () => {
      return request(app.getHttpServer())
        .get('/appointments/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(404);
    });
  });

  describe('/appointments/:id (PATCH)', () => {
    it('should update appointment status as employee', () => {
      return request(app.getHttpServer())
        .patch(`/appointments/${appointmentId}`)
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({
          status: AppointmentStatus.CONFIRMED,
        })
        .expect(200)
        .expect(res => {
          expect(res.body.status).toBe(AppointmentStatus.CONFIRMED);
        });
    });

    it('should not update appointment without proper role', () => {
      return request(app.getHttpServer())
        .patch(`/appointments/${appointmentId}`)
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          status: AppointmentStatus.CONFIRMED,
        })
        .expect(403);
    });
  });

  describe('/appointments/:id (DELETE)', () => {
    it('should delete appointment as admin', () => {
      return request(app.getHttpServer())
        .delete(`/appointments/${appointmentId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });

    it('should not delete non-existent appointment', () => {
      return request(app.getHttpServer())
        .delete('/appointments/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });
});
