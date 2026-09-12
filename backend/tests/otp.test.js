import request from 'supertest';
import app from '../src/app.js';
import { cleanTestDatabase, createTestUser } from './test-helper.js';
import { prisma } from '../src/config/database.js';
import { ROLES } from '../src/shared/constants/roles.js';
import crypto from 'crypto';

describe('OTP Verification Module', () => {
  beforeEach(async () => {
    await cleanTestDatabase();
  });

  afterAll(async () => {
    await cleanTestDatabase();
    await prisma.$disconnect();
  });

  it('should require email OTP on first login for OWNER if emailVerified is false', async () => {
    const owner = await createTestUser({
      role: ROLES.OWNER,
      email: 'unverified_owner@toyxonahub.uz',
      username: 'unverified_owner',
      password: 'OwnerPassword123!',
      emailVerified: false,
    });

    const res = await request(app).post('/api/v1/auth/login').send({
      login: owner.email,
      password: 'OwnerPassword123!',
    });

    expect(res.status).toBe(200);
    expect(res.body.data.requiresEmailVerification).toBe(true);
    expect(res.body.data.email).toBe(owner.email);

    // Verify an OTP was saved in the database
    const otp = await prisma.otpCode.findFirst({
      where: { email: owner.email },
    });
    expect(otp).toBeDefined();
    expect(otp.isUsed).toBe(false);
  });

  it('should verify valid OTP, set emailVerified = true, and return tokens', async () => {
    const owner = await createTestUser({
      role: ROLES.OWNER,
      email: 'verify_me@toyxonahub.uz',
      username: 'verify_owner',
      password: 'OwnerPassword123!',
      emailVerified: false,
    });

    const plainCode = '456789';
    const codeHash = crypto.createHash('sha256').update(plainCode).digest('hex');

    await prisma.otpCode.create({
      data: {
        email: owner.email,
        codeHash,
        userId: owner.id,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      },
    });

    const res = await request(app).post('/api/v1/auth/verify-otp').send({
      email: owner.email,
      code: plainCode,
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.emailVerified).toBe(true);
    expect(res.body.data.tokens.accessToken).toBeDefined();
    expect(res.body.data.tokens.refreshToken).toBeDefined();

    // Check database state
    const updatedUser = await prisma.user.findUnique({ where: { id: owner.id } });
    expect(updatedUser.emailVerified).toBe(true);
  });

  it('should reject invalid OTP code with 400 Bad Request', async () => {
    const owner = await createTestUser({
      role: ROLES.OWNER,
      email: 'invalid_otp@toyxonahub.uz',
      emailVerified: false,
    });

    const codeHash = crypto.createHash('sha256').update('111222').digest('hex');
    await prisma.otpCode.create({
      data: {
        email: owner.email,
        codeHash,
        userId: owner.id,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      },
    });

    const res = await request(app).post('/api/v1/auth/verify-otp').send({
      email: owner.email,
      code: '999999', // Wrong code
    });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_OTP');
  });

  it('should reject expired OTP code with 400 Bad Request', async () => {
    const owner = await createTestUser({
      role: ROLES.OWNER,
      email: 'expired_otp@toyxonahub.uz',
      emailVerified: false,
    });

    const codeHash = crypto.createHash('sha256').update('333444').digest('hex');
    await prisma.otpCode.create({
      data: {
        email: owner.email,
        codeHash,
        userId: owner.id,
        expiresAt: new Date(Date.now() - 1000), // Already expired
      },
    });

    const res = await request(app).post('/api/v1/auth/verify-otp').send({
      email: owner.email,
      code: '333444',
    });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_OTP');
  });
});
