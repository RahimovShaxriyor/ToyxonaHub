import { PrismaClient } from '@prisma/client';
import { seedUsers } from './seed/users.seed.js';
import { seedHalls } from './seed/halls.seed.js';
import { seedBookings } from './seed/bookings.seed.js';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting idempotent ToyxonaHub database seed...');
  const startTime = Date.now();

  try {
    // 1. Seed Users (Admin, Owners, Customers)
    const users = await seedUsers(prisma);

    // 2. Seed Wedding Halls + Images + Services (Singers, Cars, Menus, Karnay-Surnay)
    const halls = await seedHalls(prisma, users);

    // 3. Seed Sample Booking
    await seedBookings(prisma, users, halls);

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`\n🎉 Seed finished idempotently in ${elapsed}s! All entities preserved without duplication.`);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('Fatal seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
