import request from 'supertest';
import app from '../src/app.js';
import { cleanTestDatabase, createTestUser, createTestHall, getAuthToken } from './test-helper.js';
import { prisma } from '../src/config/database.js';
import { ROLES } from '../src/shared/constants/roles.js';
import { HALL_STATUS } from '../src/shared/constants/status.js';

describe('Authorization & RBAC Module', () => {
  beforeEach(async () => {
    await cleanTestDatabase();
  });

  afterAll(async () => {
    await cleanTestDatabase();
    await prisma.$disconnect();
  });

  it('should reject unauthenticated access with 401 Unauthorized', async () => {
    const res = await request(app).get('/api/v1/users/me');
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('should prevent USER from accessing ADMIN API (/api/v1/owners) with 403 Forbidden', async () => {
    const user = await createTestUser({ role: ROLES.USER });
    const token = getAuthToken(user);

    const res = await request(app).get('/api/v1/owners').set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  it('should prevent USER from approving a wedding hall (403 Forbidden)', async () => {
    const user = await createTestUser({ role: ROLES.USER });
    const hall = await createTestHall({ status: HALL_STATUS.PENDING });
    const token = getAuthToken(user);

    const res = await request(app)
      .patch(`/api/v1/wedding-halls/${hall.id}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: HALL_STATUS.APPROVED });

    expect(res.status).toBe(403);
  });

  it('should prevent OWNER from editing another owner`s wedding hall (403 Forbidden)', async () => {
    const owner1 = await createTestUser({ role: ROLES.OWNER });
    const owner2 = await createTestUser({ role: ROLES.OWNER });

    const hallOfOwner1 = await createTestHall({ ownerId: owner1.id });
    const tokenOwner2 = getAuthToken(owner2);

    const res = await request(app)
      .patch(`/api/v1/wedding-halls/${hallOfOwner1.id}`)
      .set('Authorization', `Bearer ${tokenOwner2}`)
      .send({ name: 'Hacked Hall Name' });

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('NOT_HALL_OWNER');
  });

  it('should hide PENDING or REJECTED halls from normal USER (404 Not Found)', async () => {
    const user = await createTestUser({ role: ROLES.USER });
    const pendingHall = await createTestHall({ status: HALL_STATUS.PENDING });
    const token = getAuthToken(user);

    const res = await request(app)
      .get(`/api/v1/wedding-halls/${pendingHall.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
  });

  it('should allow ADMIN to view PENDING hall and approve it', async () => {
    const admin = await createTestUser({ role: ROLES.ADMIN });
    const pendingHall = await createTestHall({ status: HALL_STATUS.PENDING });
    const token = getAuthToken(admin);

    // 1. Admin can view pending hall
    const getRes = await request(app)
      .get(`/api/v1/wedding-halls/${pendingHall.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(getRes.status).toBe(200);
    expect(getRes.body.data.status).toBe(HALL_STATUS.PENDING);

    // 2. Admin can approve hall
    const patchRes = await request(app)
      .patch(`/api/v1/wedding-halls/${pendingHall.id}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: HALL_STATUS.APPROVED });

    expect(patchRes.status).toBe(200);
    expect(patchRes.body.data.status).toBe(HALL_STATUS.APPROVED);
  });
});
