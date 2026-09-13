export async function seedBookings(prisma, users, halls) {
  console.log('📅 Seeding sample booking idempotently...');

  const versal = halls.versal;
  const user1 = users.user1;

  if (!versal || !user1) {
    console.warn('Skipping booking seed: Versal hall or user1 not found');
    return null;
  }

  const bookingDate = new Date(Date.UTC(2026, 9, 20)); // 2026-10-20

  let booking = await prisma.booking.findFirst({
    where: {
      weddingHallId: versal.id,
      bookingDate,
    },
    include: {
      selectedServices: true,
    },
  });

  const bookingData = {
    weddingHallId: versal.id,
    userId: user1.id,
    bookingDate,
    guestCount: 300,
    firstName: user1.firstName,
    lastName: user1.lastName,
    phone: user1.phone,
    hallPrice: 135000000.0,
    servicesPrice: 17500000.0,
    totalPrice: 152500000.0,
    advanceAmount: 30500000.0,
    status: 'ACTIVE',
    paymentStatus: 'PAID',
  };

  if (booking) {
    booking = await prisma.booking.update({
      where: { id: booking.id },
      data: bookingData,
    });
    console.log(`  ✓ Sample booking updated for ${booking.firstName} on 2026-10-20 (id: ${booking.id})`);
  } else {
    booking = await prisma.booking.create({
      data: {
        ...bookingData,
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
    console.log(`  ✓ Sample booking created for ${booking.firstName} on 2026-10-20 (id: ${booking.id})`);
  }

  return booking;
}
