import { prisma } from '../../config/database.js';
import { ConflictError } from '../../shared/errors/index.js';
import { BOOKING_STATUS } from '../../shared/constants/status.js';

export class BookingsRepository {
  async findActiveBookingByHallAndDate(weddingHallId, bookingDate, tx = prisma) {
    return tx.booking.findFirst({
      where: {
        weddingHallId,
        bookingDate,
        status: BOOKING_STATUS.ACTIVE,
      },
    });
  }

  async createBookingTransaction(bookingData, servicesSnapshots = []) {
    return prisma.$transaction(async (tx) => {
      // 1. Double-booking application check inside transaction
      const existingActive = await this.findActiveBookingByHallAndDate(
        bookingData.weddingHallId,
        bookingData.bookingDate,
        tx
      );

      if (existingActive) {
        throw new ConflictError(
          'Wedding hall is already booked for this date',
          'BOOKING_DATE_UNAVAILABLE'
        );
      }

      // 2. Insert booking record
      let booking;
      try {
        booking = await tx.booking.create({
          data: {
            weddingHallId: bookingData.weddingHallId,
            userId: bookingData.userId,
            bookingDate: bookingData.bookingDate,
            guestCount: bookingData.guestCount,
            firstName: bookingData.firstName,
            lastName: bookingData.lastName,
            phone: bookingData.phone,
            hallPrice: bookingData.hallPrice,
            servicesPrice: bookingData.servicesPrice,
            totalPrice: bookingData.totalPrice,
            advanceAmount: bookingData.advanceAmount,
            status: BOOKING_STATUS.ACTIVE,
            paymentStatus: bookingData.paymentStatus || 'PENDING',
          },
        });
      } catch (err) {
        // Concurrency guarantee: catch PostgreSQL unique constraint violation
        if (err.code === 'P2002') {
          throw new ConflictError(
            'Wedding hall is already booked for this date',
            'BOOKING_DATE_UNAVAILABLE'
          );
        }
        throw err;
      }

      // 3. Create historical snapshots for selected services
      if (servicesSnapshots && servicesSnapshots.length > 0) {
        await tx.bookingSelectedService.createMany({
          data: servicesSnapshots.map((svc) => ({
            bookingId: booking.id,
            sourceServiceId: svc.sourceServiceId,
            serviceType: svc.serviceType,
            nameSnapshot: svc.nameSnapshot,
            priceSnapshot: svc.priceSnapshot,
          })),
        });
      }

      // 4. Return complete booking with snapshots and hall details
      return tx.booking.findUnique({
        where: { id: booking.id },
        include: {
          weddingHall: {
            select: {
              id: true,
              name: true,
              district: true,
              address: true,
              phone: true,
              ownerId: true,
            },
          },
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
            },
          },
          selectedServices: true,
        },
      });
    });
  }

  async findById(id) {
    return prisma.booking.findUnique({
      where: { id },
      include: {
        weddingHall: {
          select: {
            id: true,
            name: true,
            district: true,
            address: true,
            phone: true,
            ownerId: true,
          },
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        selectedServices: true,
      },
    });
  }

  async listBookings({ where, orderBy, skip, take }) {
    const [total, items] = await Promise.all([
      prisma.booking.count({ where }),
      prisma.booking.findMany({
        where,
        orderBy,
        skip,
        take,
        include: {
          weddingHall: {
            select: {
              id: true,
              name: true,
              district: true,
              address: true,
            },
          },
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
            },
          },
          selectedServices: true,
        },
      }),
    ]);

    return { total, items };
  }

  async updateStatus(id, status) {
    return prisma.booking.update({
      where: { id },
      data: { status },
      include: {
        weddingHall: true,
        selectedServices: true,
      },
    });
  }

  async updatePaymentStatus(id, paymentStatus) {
    return prisma.booking.update({
      where: { id },
      data: { paymentStatus },
      include: {
        weddingHall: true,
        selectedServices: true,
      },
    });
  }
}

export const bookingsRepository = new BookingsRepository();
