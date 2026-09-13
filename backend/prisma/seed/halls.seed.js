import { uploadDeterministicSeedImage } from './helpers.js';

export const SEED_HALL_DEFINITIONS = [
  {
    key: 'versal',
    id: '10000000-0000-4000-b000-000000000001',
    name: 'Versal Tantanalar Saroyi',
    district: 'YUNUSOBOD',
    address: "Amir Temur shoh ko'chasi, 120",
    capacity: 600,
    pricePerSeat: 450000.0,
    phone: '+998712001122',
    status: 'APPROVED',
    ownerKey: 'owner1',
    imageFilenames: ['hall-versal.webp', 'hall-gallery-interior.webp', 'hero-1.webp'],
    singers: [
      { name: 'Ozodbek Nazarbekov', price: 15000000.0 },
      { name: 'Yulduz Usmonova', price: 20000000.0 },
    ],
    cars: [
      { brand: 'Mercedes-Benz S-Class W223', price: 3500000.0 },
      { brand: 'Rolls-Royce Ghost', price: 7000000.0 },
    ],
    menuOptions: [
      { name: "Premium Milliy To'y Menusi", price: 0.0 },
      { name: 'VIP Yevropa va Sharq Taomlari', price: 50000.0 },
    ],
    karnaySurnay: { available: true, price: 2500000.0 },
  },
  {
    key: 'yulduz',
    id: '10000000-0000-4000-b000-000000000002',
    name: 'Yulduz Grand Palace',
    district: 'CHILONZOR',
    address: "Bunyodkor shoh ko'chasi, 45",
    capacity: 500,
    pricePerSeat: 380000.0,
    phone: '+998712334455',
    status: 'APPROVED',
    ownerKey: 'owner1',
    imageFilenames: ['hall-yulduz.webp', 'hall-gallery-tables.webp', 'hero-2.webp'],
    singers: [
      { name: 'Shohruhxon', price: 12000000.0 },
    ],
    cars: [
      { brand: 'BMW 7 Series G12', price: 3000000.0 },
    ],
    menuOptions: [
      { name: "Klassik To'y Dasturxoni", price: 0.0 },
    ],
    karnaySurnay: { available: true, price: 2000000.0 },
  },
  {
    key: 'oq-saroy',
    id: '10000000-0000-4000-b000-000000000003',
    name: 'Oq Saroy Tantanalari',
    district: 'YAKKASAROY',
    address: "Shota Rustaveli ko'chasi, 15",
    capacity: 400,
    pricePerSeat: 400000.0,
    phone: '+998712990011',
    status: 'APPROVED',
    ownerKey: 'owner1',
    imageFilenames: ['hall-oqsaroy.webp', 'hall-gallery-stage.webp', 'hero-3.webp'],
    singers: [
      { name: 'Munisa Rizayeva', price: 16000000.0 },
    ],
    cars: [
      { brand: 'Mercedes-Maybach S580', price: 5000000.0 },
    ],
    menuOptions: [
      { name: "Shahona To'y Menusi", price: 0.0 },
    ],
    karnaySurnay: { available: true, price: 2200000.0 },
  },
  {
    key: 'mumtoz',
    id: '10000000-0000-4000-b000-000000000004',
    name: 'Mumtoz Tantanalar Saroyi',
    district: 'SHAYXONTOHUR',
    address: "Navoiy ko'chasi, 24",
    capacity: 700,
    pricePerSeat: 520000.0,
    phone: '+998712445566',
    status: 'APPROVED',
    ownerKey: 'owner1',
    imageFilenames: ['hall-mumtoz.webp', 'hall-gallery-interior.webp', 'hero-1.webp'],
    singers: [
      { name: 'Tohir Sodiqov (Bolalar)', price: 18000000.0 },
    ],
    cars: [
      { brand: 'Rolls-Royce Phantom', price: 8000000.0 },
    ],
    menuOptions: [
      { name: "Imperator To'y Menusi", price: 60000.0 },
    ],
    karnaySurnay: { available: true, price: 2800000.0 },
  },
  {
    key: 'charxpalak',
    id: '10000000-0000-4000-b000-000000000005',
    name: 'Charxpalak Banquet Hall',
    district: 'MIROBOD',
    address: "Nukus ko'chasi, 72",
    capacity: 250,
    pricePerSeat: 320000.0,
    phone: '+998712556677',
    status: 'APPROVED',
    ownerKey: 'owner1',
    imageFilenames: ['hall-charxpalak.webp', 'hall-gallery-tables.webp', 'hero-2.webp'],
    singers: [
      { name: "Lola Yo'ldosheva", price: 14000000.0 },
    ],
    cars: [
      { brand: 'Mercedes-Benz E-Class W213', price: 2000000.0 },
    ],
    menuOptions: [
      { name: "Shinam To'y Dasturxoni", price: 0.0 },
    ],
    karnaySurnay: { available: true, price: 1800000.0 },
  },
  {
    key: 'sulton-saroy',
    id: '10000000-0000-4000-b000-000000000006',
    name: 'Sulton Saroy',
    district: 'SERGELI',
    address: "Yangisergeli ko'chasi, 19",
    capacity: 350,
    pricePerSeat: 280000.0,
    phone: '+998712667788',
    status: 'APPROVED',
    ownerKey: 'owner1',
    imageFilenames: ['hall-sultonsaroy.webp', 'hall-gallery-stage.webp', 'hero-3.webp'],
    singers: [
      { name: "Rayhon G'aniyeva", price: 15000000.0 },
    ],
    cars: [
      { brand: 'BMW 5 Series', price: 2200000.0 },
    ],
    menuOptions: [
      { name: "Milliy To'y Taomlari", price: 0.0 },
    ],
    karnaySurnay: { available: true, price: 1900000.0 },
  },
  {
    key: 'safiya-palace',
    id: '10000000-0000-4000-b000-000000000007',
    name: 'Safiya Palace',
    district: 'MIRZO_ULUGBEK',
    address: "Buyuk Ipak Yo'li ko'chasi, 114",
    capacity: 450,
    pricePerSeat: 420000.0,
    phone: '+998712889900',
    status: 'APPROVED',
    ownerKey: 'owner1',
    imageFilenames: ['hall-safiya.webp', 'hall-gallery-interior.webp', 'hero-4.webp'],
    singers: [
      { name: 'Sardor Rahimxon', price: 13000000.0 },
    ],
    cars: [
      { brand: 'Porsche Panamera', price: 4500000.0 },
    ],
    menuOptions: [
      { name: "Yevropa va Milliy Fyujshen", price: 40000.0 },
    ],
    karnaySurnay: { available: true, price: 2100000.0 },
  },
  {
    key: 'bahor',
    id: '10000000-0000-4000-b000-000000000008',
    name: 'Bahor Tantanalar Zali',
    district: 'UCHTEPA',
    address: "Farhod ko'chasi, 33",
    capacity: 200,
    pricePerSeat: 250000.0,
    phone: '+998712112233',
    status: 'APPROVED',
    ownerKey: 'owner1',
    imageFilenames: ['hall-bahor.webp', 'hall-gallery-tables.webp', 'hall-mumtoz.webp'],
    singers: [
      { name: 'Botir Qodirov', price: 11000000.0 },
    ],
    cars: [
      { brand: 'Chevrolet Malibu 2', price: 1500000.0 },
    ],
    menuOptions: [
      { name: "Hamyonbop To'y Taomnoma", price: 0.0 },
    ],
    karnaySurnay: { available: true, price: 1500000.0 },
  },
  {
    key: 'navroz',
    id: '10000000-0000-4000-b000-000000000009',
    name: "Navro'z Banquet Hall",
    district: 'BEKTEMIR',
    address: "Bektemir shoh ko'chasi, 5",
    capacity: 300,
    pricePerSeat: 290000.0,
    phone: '+998712778899',
    status: 'PENDING',
    ownerKey: 'owner2',
    imageFilenames: ['hall-navroz.webp', 'hall-gallery-stage.webp', 'hall-charxpalak.webp'],
    singers: [],
    cars: [],
    menuOptions: [],
    karnaySurnay: { available: false, price: 0.0 },
  },
];

export async function seedHalls(prisma, users) {
  console.log('🏛️  Seeding wedding halls and services idempotently...');
  const halls = {};

  for (const def of SEED_HALL_DEFINITIONS) {
    const owner = users[def.ownerKey];
    const ownerId = owner?.id || null;

    // 1. Stable hall lookup: by stable ID first, then fallback to name
    let hall = await prisma.weddingHall.findUnique({ where: { id: def.id } });
    if (!hall) {
      hall = await prisma.weddingHall.findFirst({ where: { name: def.name } });
    }

    const hallData = {
      name: def.name,
      district: def.district,
      address: def.address,
      capacity: def.capacity,
      pricePerSeat: def.pricePerSeat,
      phone: def.phone,
      status: def.status,
      ownerId,
    };

    if (hall) {
      hall = await prisma.weddingHall.update({
        where: { id: hall.id },
        data: hallData,
      });
    } else {
      hall = await prisma.weddingHall.create({
        data: {
          id: def.id,
          ...hallData,
        },
      });
    }

    halls[def.key] = hall;
    console.log(`  ✓ Hall [${hall.status}] ${hall.name} (id: ${hall.id})`);

    // 2. Idempotent Images
    const deterministicUrls = [];
    for (let i = 0; i < def.imageFilenames.length; i++) {
      const filename = def.imageFilenames[i];
      const isPrimary = i === 0;
      const deterministicObjectName = `${def.key}_img_${i + 1}_${filename}`;
      const imageUrl = await uploadDeterministicSeedImage(
        filename,
        `wedding-halls/${def.key}`,
        deterministicObjectName
      );
      deterministicUrls.push(imageUrl);

      const existingImage = await prisma.weddingHallImage.findFirst({
        where: {
          weddingHallId: hall.id,
          url: imageUrl,
        },
      });

      if (!existingImage) {
        await prisma.weddingHallImage.create({
          data: {
            weddingHallId: hall.id,
            url: imageUrl,
            isPrimary,
          },
        });
      } else if (existingImage.isPrimary !== isPrimary) {
        await prisma.weddingHallImage.update({
          where: { id: existingImage.id },
          data: { isPrimary },
        });
      }
    }

    // Prune legacy non-deterministic image records for this hall
    await prisma.weddingHallImage.deleteMany({
      where: {
        weddingHallId: hall.id,
        url: { notIn: deterministicUrls },
      },
    });

    // 3. Idempotent Singers
    for (const s of def.singers) {
      const existingSinger = await prisma.singer.findFirst({
        where: { weddingHallId: hall.id, name: s.name },
      });
      if (existingSinger) {
        await prisma.singer.update({
          where: { id: existingSinger.id },
          data: { price: s.price },
        });
      } else {
        await prisma.singer.create({
          data: {
            weddingHallId: hall.id,
            name: s.name,
            price: s.price,
          },
        });
      }
    }

    // 4. Idempotent Cars
    for (const c of def.cars) {
      const existingCar = await prisma.car.findFirst({
        where: { weddingHallId: hall.id, brand: c.brand },
      });
      if (existingCar) {
        await prisma.car.update({
          where: { id: existingCar.id },
          data: { price: c.price },
        });
      } else {
        await prisma.car.create({
          data: {
            weddingHallId: hall.id,
            brand: c.brand,
            price: c.price,
          },
        });
      }
    }

    // 5. Idempotent Menu Options
    for (const m of def.menuOptions) {
      const existingMenu = await prisma.menuOption.findFirst({
        where: { weddingHallId: hall.id, name: m.name },
      });
      if (existingMenu) {
        await prisma.menuOption.update({
          where: { id: existingMenu.id },
          data: { price: m.price },
        });
      } else {
        await prisma.menuOption.create({
          data: {
            weddingHallId: hall.id,
            name: m.name,
            price: m.price,
          },
        });
      }
    }

    // 6. Idempotent Karnay-Surnay
    if (def.karnaySurnay) {
      await prisma.karnaySurnayService.upsert({
        where: { weddingHallId: hall.id },
        update: {
          available: def.karnaySurnay.available,
          price: def.karnaySurnay.price,
        },
        create: {
          weddingHallId: hall.id,
          available: def.karnaySurnay.available,
          price: def.karnaySurnay.price,
        },
      });
    }
  }

  return halls;
}
