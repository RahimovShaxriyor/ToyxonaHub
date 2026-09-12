import { z } from 'zod';
import { BOOKING_STATUS } from '../../shared/constants/status.js';
import { TASHKENT_DISTRICTS } from '../../shared/constants/districts.js';

const phoneRegex = /^\+?[0-9]{9,15}$/;
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

export const createBookingSchema = {
  body: z.object({
    weddingHallId: z.string().uuid('Invalid wedding hall ID'),
    bookingDate: z.string().regex(dateRegex, 'Booking date must be in YYYY-MM-DD format'),
    guestCount: z.coerce.number().int().positive('Guest count must be a positive integer'),
    firstName: z.string().trim().min(2, 'First name must be at least 2 characters').max(50),
    lastName: z.string().trim().min(2, 'Last name must be at least 2 characters').max(50),
    phone: z.string().trim().regex(phoneRegex, 'Invalid phone number format'),
    selectedSingerId: z.string().uuid().optional(),
    selectedCarId: z.string().uuid().optional(),
    selectedMenuId: z.string().uuid().optional(),
    includeKarnaySurnay: z.coerce.boolean().optional().default(false),
  }),
};

export const listBookingsQuerySchema = {
  query: z.object({
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(100).optional().default(10),
    status: z
      .enum([BOOKING_STATUS.ACTIVE, BOOKING_STATUS.CANCELLED, BOOKING_STATUS.COMPLETED])
      .optional(),
    timeStatus: z.enum(['UPCOMING', 'PAST']).optional(),
    date: z.string().regex(dateRegex).optional(),
    weddingHallId: z.string().uuid().optional(),
    hall: z.string().uuid().optional(),
    district: z.enum(TASHKENT_DISTRICTS).optional(),
    sortBy: z.enum(['bookingDate', 'createdAt', 'totalPrice']).optional().default('bookingDate'),
    order: z.enum(['asc', 'desc']).optional().default('desc'),
  }),
};
