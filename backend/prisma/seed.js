import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { storageService } from '../src/shared/storage/storage.service.js';

const prisma = new PrismaClient();
const SALT_ROUNDS = 12;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SEED_ASSETS_DIR = path.join(__dirname, 'seed-assets');

async function uploadSeedImage(localFilename, folder) {
  try {
    const filePath = path.join(SEED_ASSETS_DIR, localFilename);
    const buffer = await fs.readFile(filePath);
    const uploaded = await storageService.uploadFile(
      { buffer, originalname: localFilename, mimetype: 'image/webp' },
      folder
    );
    return uploaded.url;
  } catch (err) {
    console.warn(`MinIO upload fallback for ${localFilename}: ${err.message}`);
    return `/images/halls/${localFilename}`;
  }
}

async function main() {
  console.log('🌱 Seeding ToyxonaHub database with 8 approved halls and MinIO images...');

  // 1. Clean existing seed records (Idempotency guarantee)
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

  // 2. Create Admin User
  const adminPassword = await bcrypt.hash('AdminPassword123!', SALT_ROUNDS);
  const admin = await prisma.user.create({
    data: {
      firstName: 'Alisher',
      lastName: 'Usmonov',
      email: 'admin@toyxonahub.uz',
      username: 'admin',
      passwordHash: adminPassword,
      phone: '+998901110001',
      role: 'ADMIN',
      emailVerified: true,
    },
  });
  console.log(`✅ Admin created: ${admin.email}`);

  // 3. Create Owners
  const ownerPassword = await bcrypt.hash('OwnerPassword123!', SALT_ROUNDS);
  const owner1 = await prisma.user.create({
    data: {
      firstName: 'Rustam',
      lastName: 'Oripov',
      email: 'owner1@toyxonahub.uz',
      username: 'owner_versal',
      passwordHash: ownerPassword,
      phone: '+998901110002',
      role: 'OWNER',
      emailVerified: true,
    },
  });

  const owner2 = await prisma.user.create({
    data: {
      firstName: 'Bahodir',
      lastName: 'Shamsiyev',
      email: 'owner2@toyxonahub.uz',
      username: 'owner_yulduz',
      passwordHash: ownerPassword,
      phone: '+998901110003',
      role: 'OWNER',
      emailVerified: false,
    },
  });
  console.log(`✅ Owners created: ${owner1.email}, ${owner2.email}`);

  // 4. Create Regular Users
  const userPassword = await bcrypt.hash('UserPassword123!', SALT_ROUNDS);
  const user1 = await prisma.user.create({
    data: {
      firstName: 'Jasur',
      lastName: 'Karimov',
      email: 'user1@example.com',
      username: 'jasur_k',
      passwordHash: userPassword,
      phone: '+998909876541',
      role: 'USER',
      emailVerified: true,
    },
  });

  const user2 = await prisma.user.create({
    data: {
      firstName: 'Madina',
      lastName: 'Aliyeva',
      email: 'user2@example.com',
      username: 'madina_a',
      passwordHash: userPassword,
      phone: '+998909876542',
      role: 'USER',
      emailVerified: true,
    },
  });
  console.log(`✅ Users created: ${user1.email}, ${user2.email}`);

  // Helper for uploading image sets
  const seedImagePool = [
    'hero-1.webp',
    'hero-2.webp',
    'hero-3.webp',
    'hero-4.webp',
    'hall-mumtoz.webp',
    'hall-sultonsaroy.webp',
    'hall-charxpalak.webp',
  ];

  const uploadImagesForHall = async (hallSlug, primaryIdx, secIdx1, secIdx2) => {
    const url1 = await uploadSeedImage(seedImagePool[primaryIdx % seedImagePool.length], `wedding-halls/${hallSlug}`);
    const url2 = await uploadSeedImage(seedImagePool[secIdx1 % seedImagePool.length], `wedding-halls/${hallSlug}`);
    const url3 = await uploadSeedImage(seedImagePool[secIdx2 % seedImagePool.length], `wedding-halls/${hallSlug}`);
    return [
      { url: url1, isPrimary: true },
      { url: url2, isPrimary: false },
      { url: url3, isPrimary: false },
    ];
  };

  // 5. Create 8 Approved Halls + 1 Pending Hall
  console.log('Uploading images to MinIO and creating wedding halls...');

  // Hall 1: Versal
  const hall1Images = await uploadImagesForHall('versal', 0, 1, 2);
  const hall1 = await prisma.weddingHall.create({
    data: {
      name: 'Versal Tantanalar Saroyi',
      district: 'YUNUSOBOD',
      address: "Amir Temur shoh ko'chasi, 120",
      capacity: 600,
      pricePerSeat: 450000.0,
      phone: '+998712001122',
      status: 'APPROVED',
      ownerId: owner1.id,
      images: { create: hall1Images },
      singers: {
        create: [
          { name: 'Ozodbek Nazarbekov', price: 15000000.0 },
          { name: 'Yulduz Usmonova', price: 20000000.0 },
        ],
      },
      cars: {
        create: [
          { brand: 'Mercedes-Benz S-Class W223', price: 3500000.0 },
          { brand: 'Rolls-Royce Ghost', price: 7000000.0 },
        ],
      },
      menuOptions: {
        create: [
          { name: "Premium Milliy To'y Menusi", price: 0.0 },
          { name: 'VIP Yevropa va Sharq Taomlari', price: 50000.0 },
        ],
      },
      karnaySurnay: {
        create: { available: true, price: 2500000.0 },
      },
    },
  });

  // Hall 2: Yulduz Grand Palace
  const hall2Images = await uploadImagesForHall('yulduz', 1, 2, 3);
  const hall2 = await prisma.weddingHall.create({
    data: {
      name: 'Yulduz Grand Palace',
      district: 'CHILONZOR',
      address: "Bunyodkor shoh ko'chasi, 45",
      capacity: 500,
      pricePerSeat: 380000.0,
      phone: '+998712334455',
      status: 'APPROVED',
      ownerId: owner1.id,
      images: { create: hall2Images },
      singers: {
        create: [
          { name: 'Shohruhxon', price: 12000000.0 },
        ],
      },
      cars: {
        create: [
          { brand: 'BMW 7 Series G12', price: 3000000.0 },
        ],
      },
      menuOptions: {
        create: [
          { name: "Klassik To'y Dasturxoni", price: 0.0 },
        ],
      },
      karnaySurnay: {
        create: { available: true, price: 2000000.0 },
      },
    },
  });

  // Hall 3: Oq Saroy Tantanalari
  const hall3Images = await uploadImagesForHall('oq-saroy', 2, 3, 4);
  const hall3 = await prisma.weddingHall.create({
    data: {
      name: 'Oq Saroy Tantanalari',
      district: 'YAKKASAROY',
      address: "Shota Rustaveli ko'chasi, 15",
      capacity: 400,
      pricePerSeat: 400000.0,
      phone: '+998712990011',
      status: 'APPROVED',
      ownerId: owner1.id,
      images: { create: hall3Images },
      singers: {
        create: [
          { name: 'Munisa Rizayeva', price: 16000000.0 },
        ],
      },
      cars: {
        create: [
          { brand: 'Mercedes-Maybach S580', price: 5000000.0 },
        ],
      },
      menuOptions: {
        create: [
          { name: "Shahona To'y Menusi", price: 0.0 },
        ],
      },
      karnaySurnay: {
        create: { available: true, price: 2200000.0 },
      },
    },
  });

  // Hall 4: Mumtoz Tantanalar Saroyi
  const hall4Images = await uploadImagesForHall('mumtoz', 4, 5, 0);
  const hall4 = await prisma.weddingHall.create({
    data: {
      name: 'Mumtoz Tantanalar Saroyi',
      district: 'SHAYXONTOHUR',
      address: "Navoiy ko'chasi, 24",
      capacity: 700,
      pricePerSeat: 520000.0,
      phone: '+998712445566',
      status: 'APPROVED',
      ownerId: owner1.id,
      images: { create: hall4Images },
      singers: {
        create: [
          { name: 'Tohir Sodiqov (Bolalar)', price: 18000000.0 },
        ],
      },
      cars: {
        create: [
          { brand: 'Rolls-Royce Phantom', price: 8000000.0 },
        ],
      },
      menuOptions: {
        create: [
          { name: "Imperator To'y Menusi", price: 60000.0 },
        ],
      },
      karnaySurnay: {
        create: { available: true, price: 2800000.0 },
      },
    },
  });

  // Hall 5: Charxpalak Banquet Hall
  const hall5Images = await uploadImagesForHall('charxpalak', 6, 0, 1);
  const hall5 = await prisma.weddingHall.create({
    data: {
      name: 'Charxpalak Banquet Hall',
      district: 'MIROBOD',
      address: "Nukus ko'chasi, 72",
      capacity: 250,
      pricePerSeat: 320000.0,
      phone: '+998712556677',
      status: 'APPROVED',
      ownerId: owner1.id,
      images: { create: hall5Images },
      singers: {
        create: [
          { name: 'Lola Yo\'ldosheva', price: 14000000.0 },
        ],
      },
      cars: {
        create: [
          { brand: 'Mercedes-Benz E-Class W213', price: 2000000.0 },
        ],
      },
      menuOptions: {
        create: [
          { name: "Shinam To'y Dasturxoni", price: 0.0 },
        ],
      },
      karnaySurnay: {
        create: { available: true, price: 1800000.0 },
      },
    },
  });

  // Hall 6: Sulton Saroy
  const hall6Images = await uploadImagesForHall('sulton-saroy', 5, 2, 4);
  const hall6 = await prisma.weddingHall.create({
    data: {
      name: 'Sulton Saroy',
      district: 'SERGELI',
      address: "Yangisergeli ko'chasi, 19",
      capacity: 350,
      pricePerSeat: 280000.0,
      phone: '+998712667788',
      status: 'APPROVED',
      ownerId: owner1.id,
      images: { create: hall6Images },
      singers: {
        create: [
          { name: 'Rayhon G\'aniyeva', price: 15000000.0 },
        ],
      },
      cars: {
        create: [
          { brand: 'BMW 5 Series', price: 2200000.0 },
        ],
      },
      menuOptions: {
        create: [
          { name: "Milliy To'y Taomlari", price: 0.0 },
        ],
      },
      karnaySurnay: {
        create: { available: true, price: 1900000.0 },
      },
    },
  });

  // Hall 7: Safiya Palace
  const hall7Images = await uploadImagesForHall('safiya-palace', 3, 4, 5);
  const hall7 = await prisma.weddingHall.create({
    data: {
      name: 'Safiya Palace',
      district: 'MIRZO_ULUGBEK',
      address: "Buyuk Ipak Yo'li ko'chasi, 114",
      capacity: 450,
      pricePerSeat: 420000.0,
      phone: '+998712889900',
      status: 'APPROVED',
      ownerId: owner1.id,
      images: { create: hall7Images },
      singers: {
        create: [
          { name: 'Sardor Rahimxon', price: 13000000.0 },
        ],
      },
      cars: {
        create: [
          { brand: 'Porsche Panamera', price: 4500000.0 },
        ],
      },
      menuOptions: {
        create: [
          { name: "Yevropa va Milliy Fyujshen", price: 40000.0 },
        ],
      },
      karnaySurnay: {
        create: { available: true, price: 2100000.0 },
      },
    },
  });

  // Hall 8: Bahor Tantanalar Zali
  const hall8Images = await uploadImagesForHall('bahor', 2, 6, 1);
  const hall8 = await prisma.weddingHall.create({
    data: {
      name: 'Bahor Tantanalar Zali',
      district: 'UCHTEPA',
      address: "Farhod ko'chasi, 33",
      capacity: 200,
      pricePerSeat: 250000.0,
      phone: '+998712112233',
      status: 'APPROVED',
      ownerId: owner1.id,
      images: { create: hall8Images },
      singers: {
        create: [
          { name: 'Botir Qodirov', price: 11000000.0 },
        ],
      },
      cars: {
        create: [
          { brand: 'Chevrolet Malibu 2', price: 1500000.0 },
        ],
      },
      menuOptions: {
        create: [
          { name: "Hamyonbop To'y Taomnoma", price: 0.0 },
        ],
      },
      karnaySurnay: {
        create: { available: true, price: 1500000.0 },
      },
    },
  });

  // Hall 9: Navro'z Banquet Hall (PENDING for Admin Approvals flow)
  const hall9Images = await uploadImagesForHall('navroz', 1, 3, 5);
  const hall9 = await prisma.weddingHall.create({
    data: {
      name: "Navro'z Banquet Hall",
      district: 'BEKTEMIR',
      address: "Bektemir shoh ko'chasi, 5",
      capacity: 300,
      pricePerSeat: 290000.0,
      phone: '+998712778899',
      status: 'PENDING',
      ownerId: owner2.id,
      images: { create: hall9Images },
      karnaySurnay: {
        create: { available: false, price: 0.0 },
      },
    },
  });

  console.log(`✅ 8 Approved Wedding Halls + 1 Pending Hall created with real images!`);

  // 6. Create sample booking for Versal
  const bookingDate = new Date(Date.UTC(2026, 9, 20)); // 2026-10-20
  const sampleBooking = await prisma.booking.create({
    data: {
      weddingHallId: hall1.id,
      userId: user1.id,
      bookingDate,
      guestCount: 300,
      firstName: 'Jasur',
      lastName: 'Karimov',
      phone: '+998909876541',
      hallPrice: 135000000.0,
      servicesPrice: 17500000.0,
      totalPrice: 152500000.0,
      advanceAmount: 30500000.0,
      status: 'ACTIVE',
      paymentStatus: 'PAID',
      selectedServices: {
        create: [
          {
            serviceType: 'SINGER',
            nameSnapshot: 'Ozodbek Nazarbekov',
            priceSnapshot: 15000000.0,
          },
          {
            serviceType: 'KARNAY_SURNAY',
            nameSnapshot: 'Karnay-Surnay',
            priceSnapshot: 2500000.0,
          },
        ],
      },
    },
  });
  console.log(`✅ Sample Booking created for ${sampleBooking.firstName} on 2026-10-20`);

  console.log('\n🎉 Database successfully seeded with 8 approved halls and MinIO images!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
