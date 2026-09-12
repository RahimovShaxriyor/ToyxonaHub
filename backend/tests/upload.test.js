import request from 'supertest';
import app from '../src/app.js';
import { cleanTestDatabase, createTestUser, createTestHall, getAuthToken } from './test-helper.js';
import { prisma } from '../src/config/database.js';
import { ROLES } from '../src/shared/constants/roles.js';
import { HALL_STATUS } from '../src/shared/constants/status.js';

describe('File Upload Validation & Security Module', () => {
  beforeEach(async () => {
    await cleanTestDatabase();
  });

  afterAll(async () => {
    await cleanTestDatabase();
    await prisma.$disconnect();
  });

  it('should accept valid JPEG, PNG, and WebP uploads', async () => {
    const owner = await createTestUser({ role: ROLES.OWNER });
    const hall = await createTestHall({
      ownerId: owner.id,
      status: HALL_STATUS.APPROVED,
    });
    const token = getAuthToken(owner);

    const res = await request(app)
      .post(`/api/v1/wedding-halls/${hall.id}/images`)
      .set('Authorization', `Bearer ${token}`)
      .attach('images', Buffer.from('jpeg-content'), {
        filename: 'photo.jpg',
        contentType: 'image/jpeg',
      })
      .attach('images', Buffer.from('png-content'), {
        filename: 'graphic.png',
        contentType: 'image/png',
      })
      .attach('images', Buffer.from('webp-content'), {
        filename: 'banner.webp',
        contentType: 'image/webp',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.images.length).toBe(3);
  });

  it('should reject invalid file types with 400 Bad Request (INVALID_FILE_TYPE)', async () => {
    const owner = await createTestUser({ role: ROLES.OWNER });
    const hall = await createTestHall({
      ownerId: owner.id,
      status: HALL_STATUS.APPROVED,
    });
    const token = getAuthToken(owner);

    // Attempting to upload a .txt file
    const resTxt = await request(app)
      .post(`/api/v1/wedding-halls/${hall.id}/images`)
      .set('Authorization', `Bearer ${token}`)
      .attach('images', Buffer.from('malicious script or text'), {
        filename: 'malicious.txt',
        contentType: 'text/plain',
      });

    expect(resTxt.status).toBe(400);
    expect(resTxt.body.error.code).toBe('INVALID_FILE_TYPE');

    // Attempting to upload a .pdf file
    const resPdf = await request(app)
      .post(`/api/v1/wedding-halls/${hall.id}/images`)
      .set('Authorization', `Bearer ${token}`)
      .attach('images', Buffer.from('pdf data'), {
        filename: 'document.pdf',
        contentType: 'application/pdf',
      });

    expect(resPdf.status).toBe(400);
    expect(resPdf.body.error.code).toBe('INVALID_FILE_TYPE');
  });

  it('should reject files exceeding 5MB size limit with 400 Bad Request (UPLOAD_ERROR)', async () => {
    const owner = await createTestUser({ role: ROLES.OWNER });
    const hall = await createTestHall({
      ownerId: owner.id,
      status: HALL_STATUS.APPROVED,
    });
    const token = getAuthToken(owner);

    // Create a 6MB buffer
    const largeBuffer = Buffer.alloc(6 * 1024 * 1024);

    const res = await request(app)
      .post(`/api/v1/wedding-halls/${hall.id}/images`)
      .set('Authorization', `Bearer ${token}`)
      .attach('images', largeBuffer, {
        filename: 'huge_photo.jpg',
        contentType: 'image/jpeg',
      });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('UPLOAD_ERROR');
  });
});
