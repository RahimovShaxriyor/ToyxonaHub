import request from 'supertest';
import app from '../src/app.js';
import { prisma } from '../src/config/database.js';
import { redisClient } from '../src/config/redis.js';
import { otpService } from '../src/modules/auth/otp.service.js';
import { cacheService } from '../src/shared/cache/cache.service.js';
import { storageService, StorageService } from '../src/shared/storage/storage.service.js';
import { cleanTestDatabase, createTestUser, createTestHall, getAuthToken } from './test-helper.js';
import { ROLES } from '../src/shared/constants/roles.js';
import { HALL_STATUS } from '../src/shared/constants/status.js';
import { ServiceUnavailableError, BadRequestError } from '../src/shared/errors/index.js';

describe('Infrastructure Integration: Redis, MinIO, Caching & Rate Limiting', () => {
  beforeEach(async () => {
    await cleanTestDatabase();
    await cacheService.delByPrefix('hall:');
    await cacheService.delByPrefix('otp:');
  });

  afterAll(async () => {
    await cleanTestDatabase();
    await prisma.$disconnect();
  });

  describe('1. Redis OTP Lifecycle', () => {
    it('should generate a 6-digit numeric OTP, store only SHA-256 hash with TTL, and delete upon use', async () => {
      const email = 'otp_test_lifecycle@example.com';

      const { code } = await otpService.generateOtp(email);
      expect(code).toBeDefined();
      expect(code).toMatch(/^\d{6}$/);

      // Verify that Redis stores codeHash and NOT plaintext code
      const redisKey = otpService.getOtpKey(email);
      const rawRedisData = await redisClient.get(redisKey);
      expect(rawRedisData).not.toBeNull();

      const parsed = JSON.parse(rawRedisData);
      expect(parsed.codeHash).toBeDefined();
      expect(parsed.codeHash).not.toBe(code);
      expect(parsed.codeHash.length).toBe(64); // SHA-256 hex string length
      expect(parsed.attempts).toBe(0);

      // Verify TTL is active (<= 300 seconds)
      const ttl = await redisClient.ttl(redisKey);
      expect(ttl).toBeGreaterThan(0);
      expect(ttl).toBeLessThanOrEqual(300);

      // Verify OTP with valid code
      const verifyResult = await otpService.verifyOtp(email, code);
      expect(verifyResult).toBe(true);

      // Verify single-use: key must be deleted immediately after successful verification
      const afterVerification = await redisClient.get(redisKey);
      expect(afterVerification).toBeNull();
    });

    it('should reject invalid OTP, increment attempt counter, and lock out on maximum attempts', async () => {
      const email = 'otp_test_attempts@example.com';
      const redisKey = otpService.getOtpKey(email);

      await otpService.generateOtp(email);

      // First 4 attempts with incorrect code should increment attempts
      for (let i = 1; i <= 4; i++) {
        await expect(otpService.verifyOtp(email, '000000')).rejects.toThrow(BadRequestError);

        const currentData = JSON.parse(await redisClient.get(redisKey));
        expect(currentData.attempts).toBe(i);
      }

      // 5th attempt with incorrect code should exceed maximum attempts and throw OTP_TOO_MANY_ATTEMPTS
      try {
        await otpService.verifyOtp(email, '000000');
        expect(true).toBe(false); // Should not reach here
      } catch (err) {
        expect(err.code).toBe('OTP_TOO_MANY_ATTEMPTS');
      }

      // Key should now be deleted after exceeding attempts
      const lockedData = await redisClient.get(redisKey);
      expect(lockedData).toBeNull();
    });
  });

  describe('2. Redis Rate Limiting', () => {
    it('should return HTTP 429 with standard headers when request rate limit is exceeded', async () => {
      const endpoint = '/api/v1/auth/login';
      const testIp = '198.51.100.77';

      // loginLimiter max is 10 requests per 1 minute window
      for (let i = 0; i < 10; i++) {
        await request(app)
          .post(endpoint)
          .set('x-test-rate-limit', 'true')
          .set('X-Forwarded-For', testIp)
          .send({ login: 'nonexistent_test_user', password: 'Password123!' });
      }

      // 11th request must be blocked by Redis rate limiter with HTTP 429
      const blockedRes = await request(app)
        .post(endpoint)
        .set('x-test-rate-limit', 'true')
        .set('X-Forwarded-For', testIp)
        .send({ login: 'nonexistent_test_user', password: 'Password123!' });

      expect(blockedRes.status).toBe(429);
      expect(blockedRes.body.success).toBe(false);
      expect(blockedRes.body.error.code).toBe('TOO_MANY_REQUESTS');
      expect(blockedRes.headers['retry-after']).toBeDefined();
    });
  });

  describe('3. Redis Cache & Invalidation', () => {
    it('should cache wedding hall queries and automatically invalidate cache on hall updates', async () => {
      const owner = await createTestUser({ role: ROLES.OWNER });
      const hall = await createTestHall({
        ownerId: owner.id,
        name: 'Original Cache Hall Name',
        status: HALL_STATUS.APPROVED,
      });
      const ownerToken = getAuthToken(owner);

      // First call fetches from database and populates cache
      const firstRes = await request(app).get(`/api/v1/wedding-halls/${hall.id}`);
      expect(firstRes.status).toBe(200);
      expect(firstRes.body.data.name).toBe('Original Cache Hall Name');

      // Verify cached key exists in Redis
      const cacheKey = `hall:detail:${hall.id}:public`;
      const cached = await cacheService.get(cacheKey);
      expect(cached).not.toBeNull();
      expect(cached.name).toBe('Original Cache Hall Name');

      // Update the hall via PATCH API - should invalidate all 'hall:*' cache keys
      const updateRes = await request(app)
        .patch(`/api/v1/wedding-halls/${hall.id}`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ name: 'Updated Cache Hall Name' });

      expect(updateRes.status).toBe(200);
      expect(updateRes.body.data.name).toBe('Updated Cache Hall Name');

      // Verify the old cache entry has been invalidated
      const cachedAfterUpdate = await cacheService.get(cacheKey);
      expect(cachedAfterUpdate).toBeNull();

      // Subsequent read fetches fresh data from DB and re-populates cache
      const secondRes = await request(app).get(`/api/v1/wedding-halls/${hall.id}`);
      expect(secondRes.status).toBe(200);
      expect(secondRes.body.data.name).toBe('Updated Cache Hall Name');
    });
  });

  describe('4. MinIO / S3 Object Storage', () => {
    it('should upload file to MinIO, verify its existence, and delete it cleanly', async () => {
      const file = {
        buffer: Buffer.from('sample-wedding-photo-binary-data'),
        originalname: 'wedding_photo.jpg',
        mimetype: 'image/jpeg',
      };

      const uploadResult = await storageService.uploadFile(file, 'test-uploads');
      expect(uploadResult).toBeDefined();
      expect(uploadResult.url).toContain('/toyxonahub-images/test-uploads/');
      expect(uploadResult.objectKey).toMatch(/^test-uploads\/[0-9a-f-]+\.jpg$/);

      // Verify object exists in MinIO
      const exists = await storageService.objectExists(uploadResult.objectKey);
      expect(exists).toBe(true);

      // Delete the object from MinIO
      const deleted = await storageService.deleteFile(uploadResult.url);
      expect(deleted).toBe(true);

      // Verify object no longer exists
      const existsAfterDelete = await storageService.objectExists(uploadResult.objectKey);
      expect(existsAfterDelete).toBe(false);
    });

    it('should throw ServiceUnavailableError (HTTP 503) when S3 storage connection fails', async () => {
      // Create a storage service pointing to an unreachable endpoint
      const brokenStorage = new StorageService();
      brokenStorage.client = {
        send: async () => {
          throw new Error('Connection refused to S3 endpoint');
        },
      };

      await expect(
        brokenStorage.uploadFile({
          buffer: Buffer.from('test'),
          originalname: 'test.jpg',
          mimetype: 'image/jpeg',
        })
      ).rejects.toThrow(ServiceUnavailableError);
    });
  });
});
