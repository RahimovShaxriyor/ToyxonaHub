import { z } from 'zod';

const phoneRegex = /^\+?[0-9]{9,15}$/;

export const createOwnerSchema = {
  body: z.object({
    firstName: z.string().trim().min(2).max(50),
    lastName: z.string().trim().min(2).max(50),
    email: z.string().trim().toLowerCase().email(),
    username: z
      .string()
      .trim()
      .min(3)
      .max(30)
      .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
    password: z.string().min(6).max(100),
    phone: z.string().trim().regex(phoneRegex, 'Invalid phone number format'),
  }),
};

export const listOwnersSchema = {
  query: z.object({
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(100).optional().default(10),
  }),
};
