import { z } from 'zod';

const phoneRegex = /^\+?[0-9]{9,15}$/;

export const updateProfileSchema = {
  body: z.object({
    firstName: z.string().trim().min(2).max(50).optional(),
    lastName: z.string().trim().min(2).max(50).optional(),
    phone: z.string().trim().regex(phoneRegex, 'Invalid phone number format').optional(),
  }),
};
