import { bookingsRepository } from './bookings.repository.js';
import { weddingHallsRepository } from '../wedding-halls/wedding-halls.repository.js';
import { prisma } from '../../config/database.js';
import { NotFoundError, BadRequestError, ForbiddenError } from '../../shared/errors/index.js';
import { ROLES } from '../../shared/constants/roles.js';
import {
  HALL_STATUS,
  BOOKING_STATUS,
  PAYMENT_STATUS,
  SERVICE_TYPES,
} from '../../shared/constants/status.js';
import {
  parseBusinessDate,
  formatBusinessDate,
  isPastDate,
  computeTimeStatus,
  getTashkentTodayDate,
} from '../../shared/utils/date.js';
import { calculateBookingPrices } from '../../shared/utils/price.js';
import { buildPaginationMetadata, buildPrismaPagination } from '../../shared/utils/pagination.js';

export class BookingsService {
  constructor(repo = bookingsRepository, hallRepo = weddingHallsRepository) {
    this.repo = repo;
    this.hallRepo = hallRepo;
  }

  async createBooking(user, data) {
    // 1. Business date check - past dates not allowed
    if (isPastDate(data.bookingDate)) {
      throw new BadRequestError('Cannot book dates in the past', 'PAST_DATE_NOT_ALLOWED');
    }

    // 2. Wedding hall validation
    const hall = await this.hallRepo.findById(data.weddingHallId);
    if (!hall) {
      throw new NotFoundError('Wedding hall not found', 'WEDDING_HALL_NOT_FOUND');
    }

    if (hall.status !== HALL_STATUS.APPROVED) {
      throw new BadRequestError('Wedding hall is not available for booking', 'HALL_NOT_APPROVED');
    }

    // 3. Guest count validation
    if (data.guestCount > hall.capacity) {
      throw new BadRequestError(
        `Guest count (${data.guestCount}) exceeds hall capacity (${hall.capacity})`,
        'GUEST_COUNT_EXCEEDED'
      );
    }

    // 4. Verify additional services and take immutable historical snapshots
    const snapshots = [];

    if (data.selectedSingerId) {
      const singer = await prisma.singer.findFirst({
        where: { id: data.selectedSingerId, weddingHallId: hall.id },
      });
      if (!singer) {
        throw new BadRequestError('Selected singer was not found in this wedding hall');
      }
      snapshots.push({
        sourceServiceId: singer.id,
        serviceType: SERVICE_TYPES.SINGER,
        nameSnapshot: singer.name,
        priceSnapshot: singer.price,
      });
    }

    if (data.selectedCarId) {
      const car = await prisma.car.findFirst({
        where: { id: data.selectedCarId, weddingHallId: hall.id },
      });
      if (!car) {
        throw new BadRequestError('Selected car was not found in this wedding hall');
      }
      snapshots.push({
        sourceServiceId: car.id,
        serviceType: SERVICE_TYPES.CAR,
        nameSnapshot: car.brand,
        priceSnapshot: car.price,
      });
    }

    if (data.selectedMenuId) {
      const menu = await prisma.menuOption.findFirst({
        where: { id: data.selectedMenuId, weddingHallId: hall.id },
      });
      if (!menu) {
        throw new BadRequestError('Selected menu option was not found in this wedding hall');
      }
      snapshots.push({
        sourceServiceId: menu.id,
        serviceType: SERVICE_TYPES.MENU,
        nameSnapshot: menu.name,
        priceSnapshot: menu.price,
      });
    }

    if (data.includeKarnaySurnay) {
      const karnay = await prisma.karnaySurnayService.findUnique({
        where: { weddingHallId: hall.id },
      });
      if (!karnay || !karnay.available) {
        throw new BadRequestError('Karnay-Surnay service is not available for this hall');
      }
      snapshots.push({
        sourceServiceId: karnay.id,
        serviceType: SERVICE_TYPES.KARNAY_SURNAY,
        nameSnapshot: 'Karnay-Surnay',
        priceSnapshot: karnay.price,
      });
    }

    // 5. Server-side price calculation using Decimal.js
    const calculatedPrices = calculateBookingPrices({
      pricePerSeat: hall.pricePerSeat,
      guestCount: data.guestCount,
      selectedServices: snapshots.map((s) => ({ price: s.priceSnapshot })),
    });

    // 6. Safe parsed business date
    const parsedDate = parseBusinessDate(data.bookingDate);

    // 7. Atomic transaction with concurrency check
    const booking = await this.repo.createBookingTransaction(
      {
        weddingHallId: hall.id,
        userId: user.id,
        bookingDate: parsedDate,
        guestCount: data.guestCount,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        hallPrice: calculatedPrices.hallPrice,
        servicesPrice: calculatedPrices.servicesPrice,
        totalPrice: calculatedPrices.totalPrice,
        advanceAmount: calculatedPrices.advanceAmount,
        paymentStatus: PAYMENT_STATUS.PENDING,
      },
      snapshots
    );

    return this.formatBooking(booking);
  }

  formatBooking(booking) {
    if (!booking) return null;
    return {
      ...booking,
      bookingDate: formatBusinessDate(booking.bookingDate),
      timeStatus: computeTimeStatus(booking.bookingDate),
    };
  }

  async cancelBooking(user, bookingId) {
    const booking = await this.repo.findById(bookingId);
    if (!booking) {
      throw new NotFoundError('Booking not found', 'BOOKING_NOT_FOUND');
    }

    // Permission check
    const isAdmin = user.role === ROLES.ADMIN;
    const isOwner = user.role === ROLES.OWNER && booking.weddingHall?.ownerId === user.id;
    const isUser = user.role === ROLES.USER && booking.userId === user.id;

    if (!isAdmin && !isOwner && !isUser) {
      throw new ForbiddenError(
        'You do not have permission to cancel this booking',
        'UNAUTHORIZED_CANCELLATION'
      );
    }

    if (booking.status === BOOKING_STATUS.CANCELLED) {
      throw new BadRequestError('Booking is already cancelled', 'ALREADY_CANCELLED');
    }

    if (booking.status === BOOKING_STATUS.COMPLETED) {
      throw new BadRequestError('Completed booking cannot be cancelled', 'ALREADY_COMPLETED');
    }

    const updated = await this.repo.updateStatus(bookingId, BOOKING_STATUS.CANCELLED);

    return this.formatBooking(updated);
  }

  async mockPayment(user, bookingId) {
    const booking = await this.repo.findById(bookingId);
    if (!booking) {
      throw new NotFoundError('Booking not found', 'BOOKING_NOT_FOUND');
    }

    // Customer or admin can initiate payment
    const isAdmin = user.role === ROLES.ADMIN;
    const isUser = booking.userId === user.id;
    if (!isAdmin && !isUser) {
      throw new ForbiddenError('You can only pay for your own booking', 'FORBIDDEN');
    }

    // Idempotent payment rules
    if (booking.status === BOOKING_STATUS.CANCELLED) {
      throw new BadRequestError('Cannot pay for a cancelled booking', 'BOOKING_CANCELLED');
    }

    if (booking.paymentStatus === PAYMENT_STATUS.PAID) {
      throw new BadRequestError('Booking has already been paid', 'ALREADY_PAID');
    }

    const updated = await this.repo.updatePaymentStatus(bookingId, PAYMENT_STATUS.PAID);

    return {
      success: true,
      message: "Muvaffaqiyatli to'landi",
      data: this.formatBooking(updated),
    };
  }

  async getBookingById(user, bookingId) {
    const booking = await this.repo.findById(bookingId);
    if (!booking) {
      throw new NotFoundError('Booking not found', 'BOOKING_NOT_FOUND');
    }

    const isAdmin = user.role === ROLES.ADMIN;
    const isOwner = user.role === ROLES.OWNER && booking.weddingHall?.ownerId === user.id;
    const isUser = booking.userId === user.id;

    if (!isAdmin && !isOwner && !isUser) {
      throw new ForbiddenError('Access denied to booking details', 'FORBIDDEN');
    }

    return this.formatBooking(booking);
  }

  async listUserBookings(userId, query) {
    const { page, limit, sortBy = 'createdAt', order = 'desc' } = query;
    const { skip, take } = buildPrismaPagination({ page, limit });

    const where = { userId };
    if (query.status) where.status = query.status;
    if (query.date) where.bookingDate = parseBusinessDate(query.date);
    if (query.timeStatus === 'UPCOMING') {
      where.bookingDate = { gte: getTashkentTodayDate() };
    } else if (query.timeStatus === 'PAST') {
      where.bookingDate = { lt: getTashkentTodayDate() };
    }

    const { total, items } = await this.repo.listBookings({
      where,
      orderBy: { [sortBy]: order },
      skip,
      take,
    });

    return {
      data: items.map((b) => this.formatBooking(b)),
      pagination: buildPaginationMetadata({ page, limit, total }),
    };
  }

  async listOwnerBookings(ownerId, query) {
    const { page, limit, sortBy = 'bookingDate', order = 'desc' } = query;
    const { skip, take } = buildPrismaPagination({ page, limit });

    const where = {
      weddingHall: {
        ownerId,
      },
    };
    if (query.status) where.status = query.status;
    const hallId = query.weddingHallId || query.hall;
    if (hallId) where.weddingHallId = hallId;
    if (query.date) where.bookingDate = parseBusinessDate(query.date);
    if (query.timeStatus === 'UPCOMING') {
      where.bookingDate = { gte: getTashkentTodayDate() };
    } else if (query.timeStatus === 'PAST') {
      where.bookingDate = { lt: getTashkentTodayDate() };
    }

    const { total, items } = await this.repo.listBookings({
      where,
      orderBy: { [sortBy]: order },
      skip,
      take,
    });

    return {
      data: items.map((b) => this.formatBooking(b)),
      pagination: buildPaginationMetadata({ page, limit, total }),
    };
  }

  async listAdminBookings(query) {
    const { page, limit, sortBy = 'bookingDate', order = 'desc' } = query;
    const { skip, take } = buildPrismaPagination({ page, limit });

    const where = {};
    if (query.status) where.status = query.status;
    const hallId = query.weddingHallId || query.hall;
    if (hallId) where.weddingHallId = hallId;
    if (query.date) where.bookingDate = parseBusinessDate(query.date);
    if (query.district) {
      where.weddingHall = { district: query.district };
    }
    if (query.timeStatus === 'UPCOMING') {
      where.bookingDate = { gte: getTashkentTodayDate() };
    } else if (query.timeStatus === 'PAST') {
      where.bookingDate = { lt: getTashkentTodayDate() };
    }

    const orderBy = { [sortBy]: order };

    const { total, items } = await this.repo.listBookings({
      where,
      orderBy,
      skip,
      take,
    });

    return {
      data: items.map((b) => this.formatBooking(b)),
      pagination: buildPaginationMetadata({ page, limit, total }),
    };
  }
}

export const bookingsService = new BookingsService();
