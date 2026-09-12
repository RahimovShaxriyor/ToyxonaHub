import request from 'supertest';
import app from '../src/app.js';
import { cleanTestDatabase, createTestUser, createTestHall, getAuthToken } from './test-helper.js';
import { prisma } from '../src/config/database.js';
import { ROLES } from '../src/shared/constants/roles.js';
import { HALL_STATUS } from '../src/shared/constants/status.js';

describe('Additional Services Update & Authorization Module', () => {
  beforeEach(async () => {
    await cleanTestDatabase();
  });

  afterAll(async () => {
    await cleanTestDatabase();
    await prisma.$disconnect();
  });

  it('should allow OWNER to update singer on own hall and reject unauthorized owner', async () => {
    const owner1 = await createTestUser({ role: ROLES.OWNER });
    const owner2 = await createTestUser({ role: ROLES.OWNER });
    const hall = await createTestHall({
      ownerId: owner1.id,
      status: HALL_STATUS.APPROVED,
    });

    const token1 = getAuthToken(owner1);
    const token2 = getAuthToken(owner2);

    // 1. Add singer
    const addRes = await request(app)
      .post(`/api/v1/wedding-halls/${hall.id}/services/singers`)
      .set('Authorization', `Bearer ${token1}`)
      .field('name', 'Original Singer')
      .field('price', 10000000)
      .attach('image', Buffer.from('initial-image'), {
        filename: 'singer.jpg',
        contentType: 'image/jpeg',
      });

    expect(addRes.status).toBe(201);
    const singerId = addRes.body.data.id;
    expect(addRes.body.data.name).toBe('Original Singer');

    // 2. Owner2 attempts to update singer -> 403 Forbidden
    const unauthRes = await request(app)
      .patch(`/api/v1/wedding-halls/${hall.id}/services/singers/${singerId}`)
      .set('Authorization', `Bearer ${token2}`)
      .field('name', 'Hacked Singer');

    expect(unauthRes.status).toBe(403);
    expect(unauthRes.body.error.code).toBe('NOT_HALL_OWNER');

    // 3. Owner1 updates singer name, price and replaces image
    const updateRes = await request(app)
      .patch(`/api/v1/wedding-halls/${hall.id}/services/singers/${singerId}`)
      .set('Authorization', `Bearer ${token1}`)
      .field('name', 'Updated Singer Name')
      .field('price', 15000000)
      .attach('image', Buffer.from('new-image-data'), {
        filename: 'new_singer.jpg',
        contentType: 'image/jpeg',
      });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.data.name).toBe('Updated Singer Name');
    expect(Number(updateRes.body.data.price)).toBe(15000000);
    expect(updateRes.body.data.image).toBeDefined();
  });

  it('should allow OWNER to update cortege car on own hall and reject unauthorized owner', async () => {
    const owner1 = await createTestUser({ role: ROLES.OWNER });
    const owner2 = await createTestUser({ role: ROLES.OWNER });
    const hall = await createTestHall({
      ownerId: owner1.id,
      status: HALL_STATUS.APPROVED,
    });

    const token1 = getAuthToken(owner1);
    const token2 = getAuthToken(owner2);

    // 1. Add car
    const addRes = await request(app)
      .post(`/api/v1/wedding-halls/${hall.id}/services/cars`)
      .set('Authorization', `Bearer ${token1}`)
      .field('brand', 'Mercedes-Benz S-Class')
      .field('price', 3000000);

    expect(addRes.status).toBe(201);
    const carId = addRes.body.data.id;

    // 2. Owner2 attempts update -> 403 Forbidden
    const unauthRes = await request(app)
      .patch(`/api/v1/wedding-halls/${hall.id}/services/cars/${carId}`)
      .set('Authorization', `Bearer ${token2}`)
      .field('price', 1000);

    expect(unauthRes.status).toBe(403);
    expect(unauthRes.body.error.code).toBe('NOT_HALL_OWNER');

    // 3. Owner1 updates car
    const updateRes = await request(app)
      .patch(`/api/v1/wedding-halls/${hall.id}/services/cars/${carId}`)
      .set('Authorization', `Bearer ${token1}`)
      .field('brand', 'Mercedes-Maybach')
      .field('price', 5000000);

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.data.brand).toBe('Mercedes-Maybach');
    expect(Number(updateRes.body.data.price)).toBe(5000000);
  });

  it('should allow OWNER to update menu option on own hall and reject unauthorized owner', async () => {
    const owner1 = await createTestUser({ role: ROLES.OWNER });
    const owner2 = await createTestUser({ role: ROLES.OWNER });
    const hall = await createTestHall({
      ownerId: owner1.id,
      status: HALL_STATUS.APPROVED,
    });

    const token1 = getAuthToken(owner1);
    const token2 = getAuthToken(owner2);

    // 1. Add menu
    const addRes = await request(app)
      .post(`/api/v1/wedding-halls/${hall.id}/services/menu`)
      .set('Authorization', `Bearer ${token1}`)
      .send({
        name: 'Standard Menu',
        price: 200000,
      });

    expect(addRes.status).toBe(201);
    const menuId = addRes.body.data.id;

    // 2. Owner2 attempts update -> 403 Forbidden
    const unauthRes = await request(app)
      .patch(`/api/v1/wedding-halls/${hall.id}/services/menu/${menuId}`)
      .set('Authorization', `Bearer ${token2}`)
      .send({
        price: 10000,
      });

    expect(unauthRes.status).toBe(403);
    expect(unauthRes.body.error.code).toBe('NOT_HALL_OWNER');

    // 3. Owner1 updates menu
    const updateRes = await request(app)
      .patch(`/api/v1/wedding-halls/${hall.id}/services/menu/${menuId}`)
      .set('Authorization', `Bearer ${token1}`)
      .send({
        name: 'Super VIP Menu',
        price: 350000,
      });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.data.name).toBe('Super VIP Menu');
    expect(Number(updateRes.body.data.price)).toBe(350000);
  });
});
