import request from 'supertest';
import app from '../src/app.js';
import { cleanTestDatabase, createTestUser, createTestHall, getAuthToken } from './test-helper.js';
import { prisma } from '../src/config/database.js';
import { ROLES } from '../src/shared/constants/roles.js';
import { HALL_STATUS } from '../src/shared/constants/status.js';

describe('Wedding Halls Module', () => {
  beforeEach(async () => {
    await cleanTestDatabase();
  });

  afterAll(async () => {
    await cleanTestDatabase();
    await prisma.$disconnect();
  });

  it('should allow OWNER to create a wedding hall with status PENDING', async () => {
    const owner = await createTestUser({ role: ROLES.OWNER });
    const token = getAuthToken(owner);

    const res = await request(app)
      .post('/api/v1/wedding-halls')
      .set('Authorization', `Bearer ${token}`)
      .field('name', 'Shodlik Saroyi')
      .field('district', 'YUNUSOBOD')
      .field('address', 'Shodlik ko`chasi, 12')
      .field('capacity', 450)
      .field('pricePerSeat', 320000)
      .field('phone', '+998712334455');

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe(HALL_STATUS.PENDING);
    expect(res.body.data.ownerId).toBe(owner.id);
  });

  it('should search wedding halls by partial, case-insensitive string', async () => {
    await createTestHall({ name: 'Elegant Palace', status: HALL_STATUS.APPROVED });
    await createTestHall({ name: 'Grand Shodlik', status: HALL_STATUS.APPROVED });

    // Search 'eleg'
    const res1 = await request(app).get('/api/v1/wedding-halls?search=eleg');
    expect(res1.status).toBe(200);
    expect(res1.body.data.length).toBe(1);
    expect(res1.body.data[0].name).toBe('Elegant Palace');

    // Search 'ELEG' (uppercase)
    const res2 = await request(app).get('/api/v1/wedding-halls?search=ELEG');
    expect(res2.status).toBe(200);
    expect(res2.body.data.length).toBe(1);

    // Search 'palace'
    const res3 = await request(app).get('/api/v1/wedding-halls?search=palace');
    expect(res3.status).toBe(200);
    expect(res3.body.data.length).toBe(1);

    // Search 'Lega'
    const res4 = await request(app).get('/api/v1/wedding-halls?search=Lega');
    expect(res4.status).toBe(200);
    expect(res4.body.data.length).toBe(1);
  });

  it('should filter wedding halls by district, capacity, and price', async () => {
    await createTestHall({
      name: 'Hall Chilonzor Small',
      district: 'CHILONZOR',
      capacity: 200,
      pricePerSeat: 250000,
      status: HALL_STATUS.APPROVED,
    });

    await createTestHall({
      name: 'Hall Chilonzor Big',
      district: 'CHILONZOR',
      capacity: 800,
      pricePerSeat: 500000,
      status: HALL_STATUS.APPROVED,
    });

    await createTestHall({
      name: 'Hall Yunusobod',
      district: 'YUNUSOBOD',
      capacity: 400,
      pricePerSeat: 350000,
      status: HALL_STATUS.APPROVED,
    });

    // Filter by district
    const resDistrict = await request(app).get('/api/v1/wedding-halls?district=CHILONZOR');
    expect(resDistrict.status).toBe(200);
    expect(resDistrict.body.data.length).toBe(2);

    // Filter by capacity range
    const resCapacity = await request(app).get(
      '/api/v1/wedding-halls?minCapacity=300&maxCapacity=900'
    );
    expect(resCapacity.status).toBe(200);
    expect(resCapacity.body.data.length).toBe(2);

    // Filter by price range
    const resPrice = await request(app).get('/api/v1/wedding-halls?maxPrice=300000');
    expect(resPrice.status).toBe(200);
    expect(resPrice.body.data.length).toBe(1);
    expect(resPrice.body.data[0].name).toBe('Hall Chilonzor Small');
  });

  it('should provide availability calendar for a given month', async () => {
    const hall = await createTestHall({ status: HALL_STATUS.APPROVED });

    const res = await request(app).get(
      `/api/v1/wedding-halls/${hall.id}/availability?year=2026&month=10`
    );

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBe(31); // October has 31 days
    expect(res.body.data[0]).toHaveProperty('date');
    expect(res.body.data[0]).toHaveProperty('status');
  });

  it('should hide customer details from public/user on BOOKED date, but provide them to ADMIN', async () => {
    const admin = await createTestUser({ role: ROLES.ADMIN });
    const user = await createTestUser({ role: ROLES.USER });
    const hall = await createTestHall({ status: HALL_STATUS.APPROVED });

    const userToken = getAuthToken(user);
    const adminToken = getAuthToken(admin);
    const bookingDate = '2026-10-18';

    // User creates booking
    await request(app).post('/api/v1/bookings').set('Authorization', `Bearer ${userToken}`).send({
      weddingHallId: hall.id,
      bookingDate,
      guestCount: 350,
      firstName: 'Farrux',
      lastName: 'Zokirov',
      phone: '+998901234567',
    });

    // 1. Unauthenticated public request -> BOOKED, but NO customer details
    const resPublic = await request(app).get(
      `/api/v1/wedding-halls/${hall.id}/availability?year=2026&month=10`
    );
    expect(resPublic.status).toBe(200);
    const publicSlot = resPublic.body.data.find((d) => d.date === bookingDate);
    expect(publicSlot.status).toBe('BOOKED');
    expect(publicSlot.booking).toBeUndefined();

    // 2. Regular user request -> BOOKED, but NO customer details
    const resUser = await request(app)
      .get(`/api/v1/wedding-halls/${hall.id}/availability?year=2026&month=10`)
      .set('Authorization', `Bearer ${userToken}`);
    expect(resUser.status).toBe(200);
    const userSlot = resUser.body.data.find((d) => d.date === bookingDate);
    expect(userSlot.status).toBe('BOOKED');
    expect(userSlot.booking).toBeUndefined();

    // 3. ADMIN request -> BOOKED with full customer booking details
    const resAdmin = await request(app)
      .get(`/api/v1/wedding-halls/${hall.id}/availability?year=2026&month=10`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(resAdmin.status).toBe(200);
    const adminSlot = resAdmin.body.data.find((d) => d.date === bookingDate);
    expect(adminSlot.status).toBe('BOOKED');
    expect(adminSlot.booking).toBeDefined();
    expect(adminSlot.booking.bookingId).toBeDefined();
    expect(adminSlot.booking.firstName).toBe('Farrux');
    expect(adminSlot.booking.lastName).toBe('Zokirov');
    expect(adminSlot.booking.customerName).toBe('Farrux Zokirov');
    expect(adminSlot.booking.phone).toBe('+998901234567');
    expect(adminSlot.booking.guestCount).toBe(350);
  });

  it('should allow hall OWNER to upload images, set primary, and delete image with file cleanup', async () => {
    const owner1 = await createTestUser({ role: ROLES.OWNER });
    const owner2 = await createTestUser({ role: ROLES.OWNER });
    const hall = await createTestHall({
      ownerId: owner1.id,
      status: HALL_STATUS.APPROVED,
    });

    const owner1Token = getAuthToken(owner1);
    const owner2Token = getAuthToken(owner2);

    // 1. Owner1 uploads images
    const uploadRes = await request(app)
      .post(`/api/v1/wedding-halls/${hall.id}/images`)
      .set('Authorization', `Bearer ${owner1Token}`)
      .attach('images', Buffer.from('fake-image-1'), {
        filename: 'hall1.jpg',
        contentType: 'image/jpeg',
      })
      .attach('images', Buffer.from('fake-image-2'), {
        filename: 'hall2.png',
        contentType: 'image/png',
      });

    expect(uploadRes.status).toBe(201);
    expect(uploadRes.body.success).toBe(true);
    expect(uploadRes.body.data.images.length).toBe(2);

    const image1 = uploadRes.body.data.images[0];
    const image2 = uploadRes.body.data.images[1];
    expect(image1.isPrimary).toBe(true);
    expect(image2.isPrimary).toBe(false);

    // 2. Owner1 sets image2 as primary
    const primaryRes = await request(app)
      .patch(`/api/v1/wedding-halls/${hall.id}/images/${image2.id}/primary`)
      .set('Authorization', `Bearer ${owner1Token}`);

    expect(primaryRes.status).toBe(200);
    expect(primaryRes.body.success).toBe(true);

    const updatedImage2 = await prisma.weddingHallImage.findUnique({ where: { id: image2.id } });
    expect(updatedImage2.isPrimary).toBe(true);
    const updatedImage1 = await prisma.weddingHallImage.findUnique({ where: { id: image1.id } });
    expect(updatedImage1.isPrimary).toBe(false);

    // 3. Owner2 tries to delete Owner1's hall image -> 403 Forbidden
    const unauthDelRes = await request(app)
      .delete(`/api/v1/wedding-halls/${hall.id}/images/${image2.id}`)
      .set('Authorization', `Bearer ${owner2Token}`);

    expect(unauthDelRes.status).toBe(403);
    expect(unauthDelRes.body.error.code).toBe('NOT_HALL_OWNER');

    // 4. Owner1 deletes image2 -> 200 OK
    const delRes = await request(app)
      .delete(`/api/v1/wedding-halls/${hall.id}/images/${image2.id}`)
      .set('Authorization', `Bearer ${owner1Token}`);

    expect(delRes.status).toBe(200);
    expect(delRes.body.success).toBe(true);

    // Verify image2 is removed from DB
    const imageInDb = await prisma.weddingHallImage.findUnique({
      where: { id: image2.id },
    });
    expect(imageInDb).toBeNull();
  });
});
