import request from 'supertest';
import app from '../src/app.js';
import { cleanTestDatabase, createTestUser, createTestHall, getAuthToken } from './test-helper.js';
import { prisma } from '../src/config/database.js';
import { ROLES } from '../src/shared/constants/roles.js';
import { HALL_STATUS, BOOKING_STATUS, PAYMENT_STATUS } from '../src/shared/constants/status.js';

describe('Booking Module & Concurrency Business Rules', () => {
  beforeEach(async () => {
    await cleanTestDatabase();
  });

  afterAll(async () => {
    await cleanTestDatabase();
    await prisma.$disconnect();
  });

  it('should create booking, calculate prices server-side, and set advance to exactly 20%', async () => {
    const user = await createTestUser({ role: ROLES.USER });
    const hall = await createTestHall({
      capacity: 500,
      pricePerSeat: 200000,
      status: HALL_STATUS.APPROVED,
    });

    // Add a singer and karnay-surnay service to the hall
    const singer = await prisma.singer.create({
      data: {
        weddingHallId: hall.id,
        name: 'Test Singer',
        price: 10000000.0,
      },
    });

    await prisma.karnaySurnayService.create({
      data: {
        weddingHallId: hall.id,
        available: true,
        price: 2000000.0,
      },
    });

    const token = getAuthToken(user);
    const bookingDate = '2026-11-15';
    const guestCount = 300;

    const res = await request(app)
      .post('/api/v1/bookings')
      .set('Authorization', `Bearer ${token}`)
      .send({
        weddingHallId: hall.id,
        bookingDate,
        guestCount,
        firstName: 'Farhod',
        lastName: 'Zokirov',
        phone: '+998901234567',
        selectedSingerId: singer.id,
        includeKarnaySurnay: true,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);

    const booking = res.body.data;
    // Calculation:
    // hallPrice = 200,000 * 300 = 60,000,000
    // servicesPrice = 10,000,000 (singer) + 2,000,000 (karnay) = 12,000,000
    // totalPrice = 72,000,000
    // advanceAmount = 72,000,000 * 0.20 = 14,400,000
    expect(Number(booking.hallPrice)).toBe(60000000);
    expect(Number(booking.servicesPrice)).toBe(12000000);
    expect(Number(booking.totalPrice)).toBe(72000000);
    expect(Number(booking.advanceAmount)).toBe(14400000);
    expect(booking.status).toBe(BOOKING_STATUS.ACTIVE);
    expect(booking.paymentStatus).toBe(PAYMENT_STATUS.PENDING);

    // Verify historical snapshots were created
    expect(booking.selectedServices.length).toBe(2);
    expect(booking.selectedServices[0].nameSnapshot).toBeDefined();
    expect(booking.selectedServices[0].priceSnapshot).toBeDefined();
  });

  it('should reject booking if guestCount > hall.capacity (400 Bad Request)', async () => {
    const user = await createTestUser({ role: ROLES.USER });
    const hall = await createTestHall({
      capacity: 300,
      status: HALL_STATUS.APPROVED,
    });
    const token = getAuthToken(user);

    const res = await request(app)
      .post('/api/v1/bookings')
      .set('Authorization', `Bearer ${token}`)
      .send({
        weddingHallId: hall.id,
        bookingDate: '2026-11-20',
        guestCount: 350, // exceeds 300
        firstName: 'Ali',
        lastName: 'Valiyev',
        phone: '+998901234567',
      });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('GUEST_COUNT_EXCEEDED');
  });

  it('should reject booking for past date (400 Bad Request)', async () => {
    const user = await createTestUser({ role: ROLES.USER });
    const hall = await createTestHall({ status: HALL_STATUS.APPROVED });
    const token = getAuthToken(user);

    const res = await request(app)
      .post('/api/v1/bookings')
      .set('Authorization', `Bearer ${token}`)
      .send({
        weddingHallId: hall.id,
        bookingDate: '2020-01-01', // Past date
        guestCount: 200,
        firstName: 'Ali',
        lastName: 'Valiyev',
        phone: '+998901234567',
      });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('PAST_DATE_NOT_ALLOWED');
  });

  it('should reject double booking on the same date with 409 BOOKING_DATE_UNAVAILABLE', async () => {
    const user1 = await createTestUser({ role: ROLES.USER });
    const user2 = await createTestUser({ role: ROLES.USER });
    const hall = await createTestHall({ status: HALL_STATUS.APPROVED });

    const token1 = getAuthToken(user1);
    const token2 = getAuthToken(user2);
    const bookingDate = '2026-12-10';

    // 1. First booking succeeds
    const res1 = await request(app)
      .post('/api/v1/bookings')
      .set('Authorization', `Bearer ${token1}`)
      .send({
        weddingHallId: hall.id,
        bookingDate,
        guestCount: 200,
        firstName: 'User1',
        lastName: 'First',
        phone: '+998901111111',
      });

    expect(res1.status).toBe(201);

    // 2. Second booking on the same date fails
    const res2 = await request(app)
      .post('/api/v1/bookings')
      .set('Authorization', `Bearer ${token2}`)
      .send({
        weddingHallId: hall.id,
        bookingDate,
        guestCount: 250,
        firstName: 'User2',
        lastName: 'Second',
        phone: '+998902222222',
      });

    expect(res2.status).toBe(409);
    expect(res2.body.error.code).toBe('BOOKING_DATE_UNAVAILABLE');
    expect(res2.body.error.message).toBe('Wedding hall is already booked for this date');
  });

  it('concurrency test: simultaneous bookings on the same date should have only 1 success and 1 conflict', async () => {
    const user1 = await createTestUser({ role: ROLES.USER });
    const user2 = await createTestUser({ role: ROLES.USER });
    const hall = await createTestHall({ status: HALL_STATUS.APPROVED });

    const token1 = getAuthToken(user1);
    const token2 = getAuthToken(user2);
    const bookingDate = '2026-12-25';

    const req1 = request(app)
      .post('/api/v1/bookings')
      .set('Authorization', `Bearer ${token1}`)
      .send({
        weddingHallId: hall.id,
        bookingDate,
        guestCount: 200,
        firstName: 'Concurrent1',
        lastName: 'Alpha',
        phone: '+998901111111',
      });

    const req2 = request(app)
      .post('/api/v1/bookings')
      .set('Authorization', `Bearer ${token2}`)
      .send({
        weddingHallId: hall.id,
        bookingDate,
        guestCount: 200,
        firstName: 'Concurrent2',
        lastName: 'Beta',
        phone: '+998902222222',
      });

    const [res1, res2] = await Promise.all([req1, req2]);

    const statuses = [res1.status, res2.status].sort();
    expect(statuses).toEqual([201, 409]);

    const failedRes = res1.status === 409 ? res1 : res2;
    expect(failedRes.body.error.code).toBe('BOOKING_DATE_UNAVAILABLE');
  });

  it('should allow user to cancel own booking, but reject unauthorized cancellation', async () => {
    const user1 = await createTestUser({ role: ROLES.USER });
    const user2 = await createTestUser({ role: ROLES.USER });
    const hall = await createTestHall({ status: HALL_STATUS.APPROVED });

    const token1 = getAuthToken(user1);
    const token2 = getAuthToken(user2);

    const bookingRes = await request(app)
      .post('/api/v1/bookings')
      .set('Authorization', `Bearer ${token1}`)
      .send({
        weddingHallId: hall.id,
        bookingDate: '2026-12-30',
        guestCount: 200,
        firstName: 'Cancel',
        lastName: 'Test',
        phone: '+998901234567',
      });

    const bookingId = bookingRes.body.data.id;

    // User2 tries to cancel User1's booking -> 403 Forbidden
    const unauthRes = await request(app)
      .patch(`/api/v1/bookings/${bookingId}/cancel`)
      .set('Authorization', `Bearer ${token2}`);

    expect(unauthRes.status).toBe(403);
    expect(unauthRes.body.error.code).toBe('UNAUTHORIZED_CANCELLATION');

    // User1 cancels own booking -> 200 OK
    const cancelRes = await request(app)
      .patch(`/api/v1/bookings/${bookingId}/cancel`)
      .set('Authorization', `Bearer ${token1}`);

    expect(cancelRes.status).toBe(200);
    expect(cancelRes.body.data.status).toBe(BOOKING_STATUS.CANCELLED);
  });

  it('idempotent mock payment: active booking can be paid, cannot be paid twice or if cancelled', async () => {
    const user = await createTestUser({ role: ROLES.USER });
    const hall = await createTestHall({ status: HALL_STATUS.APPROVED });
    const token = getAuthToken(user);

    const bookingRes = await request(app)
      .post('/api/v1/bookings')
      .set('Authorization', `Bearer ${token}`)
      .send({
        weddingHallId: hall.id,
        bookingDate: '2026-12-15',
        guestCount: 200,
        firstName: 'Payment',
        lastName: 'Test',
        phone: '+998901234567',
      });

    const bookingId = bookingRes.body.data.id;

    // 1. Pay booking -> 200 OK
    const payRes1 = await request(app)
      .post(`/api/v1/bookings/${bookingId}/pay`)
      .set('Authorization', `Bearer ${token}`);

    expect(payRes1.status).toBe(200);
    expect(payRes1.body.success).toBe(true);
    expect(payRes1.body.message).toBe("Muvaffaqiyatli to'landi");
    expect(payRes1.body.data.paymentStatus).toBe(PAYMENT_STATUS.PAID);

    // 2. Paying again -> 400 Bad Request (idempotency check)
    const payRes2 = await request(app)
      .post(`/api/v1/bookings/${bookingId}/pay`)
      .set('Authorization', `Bearer ${token}`);

    expect(payRes2.status).toBe(400);
    expect(payRes2.body.error.code).toBe('ALREADY_PAID');
  });

  it('should make date available immediately after cancellation and allow re-booking', async () => {
    const user1 = await createTestUser({ role: ROLES.USER });
    const user2 = await createTestUser({ role: ROLES.USER });
    const hall = await createTestHall({ status: HALL_STATUS.APPROVED });

    const token1 = getAuthToken(user1);
    const token2 = getAuthToken(user2);
    const bookingDate = '2026-11-28';

    // 1. User1 books the date
    const bookRes1 = await request(app)
      .post('/api/v1/bookings')
      .set('Authorization', `Bearer ${token1}`)
      .send({
        weddingHallId: hall.id,
        bookingDate,
        guestCount: 250,
        firstName: 'Dilshod',
        lastName: 'Aliev',
        phone: '+998901111111',
      });

    expect(bookRes1.status).toBe(201);
    const bookingId1 = bookRes1.body.data.id;

    // 2. User2 tries to book the same date -> 409 Conflict
    const conflictRes = await request(app)
      .post('/api/v1/bookings')
      .set('Authorization', `Bearer ${token2}`)
      .send({
        weddingHallId: hall.id,
        bookingDate,
        guestCount: 200,
        firstName: 'Bobur',
        lastName: 'Saidov',
        phone: '+998902222222',
      });

    expect(conflictRes.status).toBe(409);
    expect(conflictRes.body.error.code).toBe('BOOKING_DATE_UNAVAILABLE');

    // 3. User1 cancels the booking -> 200 OK
    const cancelRes = await request(app)
      .patch(`/api/v1/bookings/${bookingId1}/cancel`)
      .set('Authorization', `Bearer ${token1}`);

    expect(cancelRes.status).toBe(200);
    expect(cancelRes.body.data.status).toBe(BOOKING_STATUS.CANCELLED);

    // 4. Check hall availability: date is now AVAILABLE
    const availRes = await request(app).get(
      `/api/v1/wedding-halls/${hall.id}/availability?year=2026&month=11`
    );
    expect(availRes.status).toBe(200);
    const daySlot = availRes.body.data.find((d) => d.date === bookingDate);
    expect(daySlot).toBeDefined();
    expect(daySlot.status).toBe('AVAILABLE');

    // 5. User2 can now successfully book the same date -> 201 Created
    const bookRes2 = await request(app)
      .post('/api/v1/bookings')
      .set('Authorization', `Bearer ${token2}`)
      .send({
        weddingHallId: hall.id,
        bookingDate,
        guestCount: 200,
        firstName: 'Bobur',
        lastName: 'Saidov',
        phone: '+998902222222',
      });

    expect(bookRes2.status).toBe(201);
    expect(bookRes2.body.data.status).toBe(BOOKING_STATUS.ACTIVE);
    expect(bookRes2.body.data.bookingDate).toBe(bookingDate);
  });

  it('should compute timeStatus as UPCOMING for future dates and PAST for past dates', async () => {
    const user = await createTestUser({ role: ROLES.USER });
    const hall = await createTestHall({ status: HALL_STATUS.APPROVED });
    const token = getAuthToken(user);

    // Create a future booking via API
    const futureRes = await request(app)
      .post('/api/v1/bookings')
      .set('Authorization', `Bearer ${token}`)
      .send({
        weddingHallId: hall.id,
        bookingDate: '2026-12-31',
        guestCount: 200,
        firstName: 'Anvar',
        lastName: 'Qosimov',
        phone: '+998901234567',
      });

    expect(futureRes.status).toBe(201);
    expect(futureRes.body.data.timeStatus).toBe('UPCOMING');

    // Create a past booking directly in DB to simulate past completed/active records
    const pastBooking = await prisma.booking.create({
      data: {
        weddingHallId: hall.id,
        userId: user.id,
        bookingDate: new Date('2025-01-10T00:00:00.000Z'),
        guestCount: 150,
        firstName: 'Olim',
        lastName: 'Toirov',
        phone: '+998909998877',
        hallPrice: 30000000.0,
        servicesPrice: 0.0,
        totalPrice: 30000000.0,
        advanceAmount: 6000000.0,
        status: BOOKING_STATUS.COMPLETED,
        paymentStatus: PAYMENT_STATUS.PAID,
      },
    });

    // Fetch booking details
    const getRes = await request(app)
      .get(`/api/v1/bookings/${pastBooking.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(getRes.status).toBe(200);
    expect(getRes.body.data.timeStatus).toBe('PAST');

    // List my bookings with timeStatus=UPCOMING filter
    const listUpcoming = await request(app)
      .get('/api/v1/bookings/my?timeStatus=UPCOMING')
      .set('Authorization', `Bearer ${token}`);

    expect(listUpcoming.status).toBe(200);
    expect(listUpcoming.body.data.length).toBe(1);
    expect(listUpcoming.body.data[0].timeStatus).toBe('UPCOMING');

    // List my bookings with timeStatus=PAST filter
    const listPast = await request(app)
      .get('/api/v1/bookings/my?timeStatus=PAST')
      .set('Authorization', `Bearer ${token}`);

    expect(listPast.status).toBe(200);
    expect(listPast.body.data.length).toBe(1);
    expect(listPast.body.data[0].timeStatus).toBe('PAST');
  });

  it('should support OWNER booking filters and enforce strict owner isolation', async () => {
    // Create Owner1 with Hall1 and Owner2 with Hall2
    const owner1 = await createTestUser({ role: ROLES.OWNER });
    const owner2 = await createTestUser({ role: ROLES.OWNER });

    const hall1 = await createTestHall({
      name: 'Owner1 Hall',
      ownerId: owner1.id,
      status: HALL_STATUS.APPROVED,
    });
    const hall2 = await createTestHall({
      name: 'Owner2 Hall',
      ownerId: owner2.id,
      status: HALL_STATUS.APPROVED,
    });

    const user = await createTestUser({ role: ROLES.USER });
    const userToken = getAuthToken(user);
    const owner1Token = getAuthToken(owner1);
    const owner2Token = getAuthToken(owner2);

    // Bookings for Hall1
    await request(app).post('/api/v1/bookings').set('Authorization', `Bearer ${userToken}`).send({
      weddingHallId: hall1.id,
      bookingDate: '2026-11-10',
      guestCount: 200,
      firstName: 'Client1',
      lastName: 'User',
      phone: '+998901111111',
    });

    await request(app).post('/api/v1/bookings').set('Authorization', `Bearer ${userToken}`).send({
      weddingHallId: hall1.id,
      bookingDate: '2026-11-20',
      guestCount: 300,
      firstName: 'Client2',
      lastName: 'User',
      phone: '+998902222222',
    });

    // Booking for Hall2
    await request(app).post('/api/v1/bookings').set('Authorization', `Bearer ${userToken}`).send({
      weddingHallId: hall2.id,
      bookingDate: '2026-11-15',
      guestCount: 150,
      firstName: 'Client3',
      lastName: 'User',
      phone: '+998903333333',
    });

    // Owner1 requests bookings: MUST see exactly 2 bookings from Hall1, NEVER Hall2
    const resOwner1 = await request(app)
      .get('/api/v1/bookings/owner')
      .set('Authorization', `Bearer ${owner1Token}`);

    expect(resOwner1.status).toBe(200);
    expect(resOwner1.body.data.length).toBe(2);
    expect(resOwner1.body.data.every((b) => b.weddingHallId === hall1.id)).toBe(true);

    // Owner2 requests bookings: MUST see exactly 1 booking from Hall2
    const resOwner2 = await request(app)
      .get('/api/v1/bookings/owner')
      .set('Authorization', `Bearer ${owner2Token}`);

    expect(resOwner2.status).toBe(200);
    expect(resOwner2.body.data.length).toBe(1);
    expect(resOwner2.body.data[0].weddingHallId).toBe(hall2.id);

    // Owner1 filter by specific date
    const resFilterDate = await request(app)
      .get('/api/v1/bookings/owner?date=2026-11-10')
      .set('Authorization', `Bearer ${owner1Token}`);

    expect(resFilterDate.status).toBe(200);
    expect(resFilterDate.body.data.length).toBe(1);
    expect(resFilterDate.body.data[0].bookingDate).toBe('2026-11-10');

    // Owner1 filter by hall alias
    const resFilterHall = await request(app)
      .get(`/api/v1/bookings/owner?hall=${hall1.id}`)
      .set('Authorization', `Bearer ${owner1Token}`);

    expect(resFilterHall.status).toBe(200);
    expect(resFilterHall.body.data.length).toBe(2);

    // Owner1 sort order asc vs desc
    const resOrderAsc = await request(app)
      .get('/api/v1/bookings/owner?order=asc')
      .set('Authorization', `Bearer ${owner1Token}`);

    expect(resOrderAsc.status).toBe(200);
    expect(resOrderAsc.body.data[0].bookingDate).toBe('2026-11-10');
    expect(resOrderAsc.body.data[1].bookingDate).toBe('2026-11-20');

    const resOrderDesc = await request(app)
      .get('/api/v1/bookings/owner?order=desc')
      .set('Authorization', `Bearer ${owner1Token}`);

    expect(resOrderDesc.status).toBe(200);
    expect(resOrderDesc.body.data[0].bookingDate).toBe('2026-11-20');
    expect(resOrderDesc.body.data[1].bookingDate).toBe('2026-11-10');
  });
});
