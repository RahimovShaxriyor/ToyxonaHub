import request from 'supertest';
import app from '../src/app.js';
import { cleanTestDatabase, createTestUser } from './test-helper.js';
import { prisma } from '../src/config/database.js';

describe('Auth Module', () => {
  beforeEach(async () => {
    await cleanTestDatabase();
  });

  afterAll(async () => {
    await cleanTestDatabase();
    await prisma.$disconnect();
  });

  describe('POST /api/v1/auth/register', () => {
    it('should register a new USER successfully with hashed password and tokens', async () => {
      const res = await request(app).post('/api/v1/auth/register').send({
        firstName: 'Anvar',
        lastName: 'Qodirov',
        email: 'anvar@example.com',
        username: 'anvar_q',
        password: 'SecurePassword123!',
        phone: '+998901234567',
      });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe('anvar@example.com');
      expect(res.body.data.user.role).toBe('USER');
      expect(res.body.data.user.passwordHash).toBeUndefined();
      expect(res.body.data.tokens.accessToken).toBeDefined();
      expect(res.body.data.tokens.refreshToken).toBeDefined();
    });

    it('should reject duplicate email with 409 Conflict', async () => {
      await createTestUser({ email: 'duplicate@example.com', username: 'user_first' });

      const res = await request(app).post('/api/v1/auth/register').send({
        firstName: 'Another',
        lastName: 'User',
        email: 'duplicate@example.com',
        username: 'user_second',
        password: 'Password123!',
        phone: '+998901234567',
      });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('EMAIL_ALREADY_EXISTS');
    });

    it('should reject duplicate username with 409 Conflict', async () => {
      await createTestUser({ email: 'first@example.com', username: 'same_username' });

      const res = await request(app).post('/api/v1/auth/register').send({
        firstName: 'Second',
        lastName: 'User',
        email: 'second@example.com',
        username: 'same_username',
        password: 'Password123!',
        phone: '+998901234567',
      });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('USERNAME_ALREADY_EXISTS');
    });

    it('should return 422 on invalid request body', async () => {
      const res = await request(app).post('/api/v1/auth/register').send({
        firstName: '',
        email: 'not-an-email',
        password: '123',
      });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should log in successfully with valid email and password', async () => {
      await createTestUser({
        email: 'login_test@example.com',
        username: 'login_user',
        password: 'CorrectPassword123!',
      });

      const res = await request(app).post('/api/v1/auth/login').send({
        login: 'login_test@example.com',
        password: 'CorrectPassword123!',
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.tokens.accessToken).toBeDefined();
      expect(res.body.data.tokens.refreshToken).toBeDefined();
    });

    it('should log in successfully using username', async () => {
      await createTestUser({
        email: 'by_username@example.com',
        username: 'user_unique_name',
        password: 'CorrectPassword123!',
      });

      const res = await request(app).post('/api/v1/auth/login').send({
        login: 'user_unique_name',
        password: 'CorrectPassword123!',
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should reject login with wrong password (401 Unauthorized)', async () => {
      await createTestUser({
        email: 'wrong_pass@example.com',
        username: 'wrong_pass_user',
        password: 'CorrectPassword123!',
      });

      const res = await request(app).post('/api/v1/auth/login').send({
        login: 'wrong_pass@example.com',
        password: 'WrongPassword!',
      });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
    });

    it('should reject login for non-existent user (401 Unauthorized)', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({
        login: 'nonexistent@example.com',
        password: 'SomePassword123!',
      });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
    });
  });

  describe('POST /api/v1/auth/refresh & /logout', () => {
    it('should refresh token and rotate refresh tokens', async () => {
      await createTestUser({
        email: 'refresh_test@example.com',
        username: 'refresh_user',
        password: 'Password123!',
      });

      const loginRes = await request(app).post('/api/v1/auth/login').send({
        login: 'refresh_test@example.com',
        password: 'Password123!',
      });

      const originalRefreshToken = loginRes.body.data.tokens.refreshToken;

      const refreshRes = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: originalRefreshToken });

      expect(refreshRes.status).toBe(200);
      expect(refreshRes.body.data.tokens.accessToken).toBeDefined();
      expect(refreshRes.body.data.tokens.refreshToken).toBeDefined();
      expect(refreshRes.body.data.tokens.refreshToken).not.toBe(originalRefreshToken);

      // Old refresh token must be revoked and fail on reuse
      const secondRefreshRes = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: originalRefreshToken });

      expect(secondRefreshRes.status).toBe(401);
    });

    it('should revoke refresh token on logout', async () => {
      await createTestUser({
        email: 'logout_test@example.com',
        username: 'logout_user',
        password: 'Password123!',
      });

      const loginRes = await request(app).post('/api/v1/auth/login').send({
        login: 'logout_test@example.com',
        password: 'Password123!',
      });

      const token = loginRes.body.data.tokens.refreshToken;

      const logoutRes = await request(app)
        .post('/api/v1/auth/logout')
        .send({ refreshToken: token });

      expect(logoutRes.status).toBe(200);

      // Subsequent refresh must fail
      const refreshRes = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: token });

      expect(refreshRes.status).toBe(401);
    });
  });
});
