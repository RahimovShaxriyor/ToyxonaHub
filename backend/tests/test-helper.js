import { prisma } from '../src/config/database.js';
import { hashPassword } from '../src/shared/utils/password.js';
import { generateAccessToken } from '../src/shared/utils/token.js';
import { ROLES } from '../src/shared/constants/roles.js';
import { HALL_STATUS } from '../src/shared/constants/status.js';

export const cleanTestDatabase = async () => {
  await prisma.bookingSelectedService.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.singer.deleteMany();
  await prisma.car.deleteMany();
  await prisma.menuOption.deleteMany();
  await prisma.karnaySurnayService.deleteMany();
  await prisma.weddingHallImage.deleteMany();
  await prisma.weddingHall.deleteMany();
  await prisma.otpCode.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();
};

export const createTestUser = async ({
  role = ROLES.USER,
  email = `test_${Date.now()}_${Math.random().toString(36).substring(7)}@example.com`,
  username = `user_${Date.now()}_${Math.random().toString(36).substring(7)}`,
  password = 'Password123!',
  emailVerified = true,
  firstName = 'Test',
  lastName = 'User',
  phone = '+998901234567',
} = {}) => {
  const passwordHash = await hashPassword(password);
  return prisma.user.create({
    data: {
      firstName,
      lastName,
      email,
      username,
      passwordHash,
      phone,
      role,
      emailVerified,
    },
  });
};

export const createTestHall = async ({
  ownerId = null,
  name = 'Test Wedding Palace',
  district = 'CHILONZOR',
  address = 'Test street 1',
  capacity = 500,
  pricePerSeat = 300000,
  phone = '+998711112233',
  status = HALL_STATUS.APPROVED,
} = {}) => {
  return prisma.weddingHall.create({
    data: {
      name,
      district,
      address,
      capacity,
      pricePerSeat,
      phone,
      status,
      ownerId,
    },
  });
};

export const getAuthToken = (user) => {
  return generateAccessToken({
    sub: user.id,
    role: user.role,
    email: user.email,
  });
};
