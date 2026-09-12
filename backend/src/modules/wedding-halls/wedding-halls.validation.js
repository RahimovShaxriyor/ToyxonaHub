import { z } from 'zod';
import { TASHKENT_DISTRICTS } from '../../shared/constants/districts.js';
import { HALL_STATUS } from '../../shared/constants/status.js';

const phoneRegex = /^\+?[0-9]{9,15}$/;

export const createHallSchema = {
  body: z.object({
    name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
    district: z.enum(TASHKENT_DISTRICTS, {
      errorMap: () => ({ message: 'District must be one of the 12 Tashkent districts' }),
    }),
    address: z.string().trim().min(3, 'Address must be at least 3 characters').max(200),
    capacity: z.coerce.number().int().min(10, 'Capacity must be at least 10').max(10000),
    pricePerSeat: z.coerce.number().positive('Price per seat must be a positive number'),
    phone: z.string().trim().regex(phoneRegex, 'Invalid phone number format'),
    ownerId: z.string().uuid().optional(),
  }),
};

export const updateHallSchema = {
  body: z.object({
    name: z.string().trim().min(2).max(100).optional(),
    district: z.enum(TASHKENT_DISTRICTS).optional(),
    address: z.string().trim().min(3).max(200).optional(),
    capacity: z.coerce.number().int().min(10).max(10000).optional(),
    pricePerSeat: z.coerce.number().positive().optional(),
    phone: z.string().trim().regex(phoneRegex).optional(),
  }),
};

export const updateStatusSchema = {
  body: z.object({
    status: z.enum([HALL_STATUS.APPROVED, HALL_STATUS.REJECTED]),
  }),
};

export const assignOwnerSchema = {
  body: z.object({
    ownerId: z.string().uuid('Invalid owner ID format'),
  }),
};

export const listHallsQuerySchema = {
  query: z.object({
    search: z.string().trim().optional(),
    district: z.enum(TASHKENT_DISTRICTS).optional(),
    minCapacity: z.coerce.number().int().positive().optional(),
    maxCapacity: z.coerce.number().int().positive().optional(),
    minPrice: z.coerce.number().positive().optional(),
    maxPrice: z.coerce.number().positive().optional(),
    status: z.enum([HALL_STATUS.APPROVED, HALL_STATUS.PENDING, HALL_STATUS.REJECTED]).optional(),
    sortBy: z
      .enum(['name', 'capacity', 'pricePerSeat', 'createdAt'])
      .optional()
      .default('createdAt'),
    order: z.enum(['asc', 'desc']).optional().default('desc'),
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(100).optional().default(10),
  }),
};

export const availabilityQuerySchema = {
  query: z.object({
    year: z.coerce.number().int().min(2020).max(2100),
    month: z.coerce.number().int().min(1).max(12),
  }),
};
