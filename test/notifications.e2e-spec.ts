import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { Role, NotificationType } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';

describe('NotificationsController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;

  // Tokens para diferentes tipos de usuários
  let userToken: string;
  let adminToken: string;

  // IDs para testes
  let userId: string;
  let adminId: string;
  let notificationId: string;

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
    await prisma.notification.deleteMany();
    await prisma.user.deleteMany({
      where: {
        email: {
          contains: 'notifications-test'
        }
      }
    });

    // Create users with unique emails
    const user = await prisma.user.create({
      data: {
        email: `notifications-test-user-${Date.now()}@test.com`,
        password: 'password123',
        name: 'Test User',
        role: Role.CLIENT,
      },
    });
    userId = user.id;

    const admin = await prisma.user.create({
      data: {
        email: `notifications-test-admin-${Date.now()}@test.com`,
        password: 'password123',
        name: 'Test Admin',
        role: Role.ADMIN,
      },
    });
    adminId = admin.id;

    // Create tokens JWT
    userToken = jwtService.sign({ id: user.id, email: user.email, role: user.role });
    adminToken = jwtService.sign({ id: admin.id, email: admin.email, role: admin.role });

    // Create notification
    const notification = await prisma.notification.create({
      data: {
        userId: userId,
        title: 'Test Notification',
        message: 'Test Message',
        type: NotificationType.GENERAL,
      },
    });
    notificationId = notification.id;
  });

  afterAll(async () => {
    // Clean up in correct order
    await prisma.notification.deleteMany();
    await prisma.user.deleteMany({
      where: {
        email: {
          contains: 'notifications-test'
        }
      }
    });
    await app.close();
  });

  describe('/notifications (GET)', () => {
    it('should get all notifications for user', () => {
      return request(app.getHttpServer())
        .get('/notifications')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200)
        .expect(res => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
          expect(res.body[0]).toHaveProperty('title');
          expect(res.body[0]).toHaveProperty('message');
          expect(res.body[0]).toHaveProperty('read');
        });
    });

    it('should not get notifications without authentication', () => {
      return request(app.getHttpServer())
        .get('/notifications')
        .expect(401);
    });
  });

  describe('/notifications/unread (GET)', () => {
    it('should get unread notifications for user', () => {
      return request(app.getHttpServer())
        .get('/notifications/unread')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200)
        .expect(res => {
          expect(Array.isArray(res.body)).toBe(true);
          res.body.forEach(notification => {
            expect(notification.read).toBe(false);
          });
        });
    });
  });

  describe('/notifications/:id/read (POST)', () => {
    it('should mark notification as read', () => {
      return request(app.getHttpServer())
        .post(`/notifications/${notificationId}/read`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(201)
        .expect(res => {
          expect(res.body.id).toBe(notificationId);
          expect(res.body.read).toBe(true);
        });
    });

    it('should not mark notification as read for wrong user', () => {
      return request(app.getHttpServer())
        .post(`/notifications/${notificationId}/read`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });

  describe('/notifications/mark-all-read (POST)', () => {
    beforeEach(async () => {
      // Create some unread notifications for test
      await prisma.notification.createMany({
        data: [
          {
            userId: userId,
            title: 'Unread 1',
            message: 'Message 1',
            type: NotificationType.GENERAL,
          },
          {
            userId: userId,
            title: 'Unread 2',
            message: 'Message 2',
            type: NotificationType.GENERAL,
          },
        ],
      });
    });

    it('should mark all notifications as read', async () => {
      await request(app.getHttpServer())
        .post('/notifications/mark-all-read')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(201);

      // Verify all notifications were marked as read
      const unreadNotifications = await prisma.notification.findMany({
        where: {
          userId,
          read: false,
        },
      });

      expect(unreadNotifications.length).toBe(0);
    });
  });
});
