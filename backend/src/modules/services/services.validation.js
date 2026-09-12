import { z } from 'zod';

export const createSingerSchema = {
  body: z.object({
    name: z.string().trim().min(2).max(100),
    price: z.coerce.number().positive('Price must be a positive number'),
  }),
};

export const createCarSchema = {
  body: z
    .object({
      brand: z.string().trim().min(2).max(100).optional(),
      model: z.string().trim().min(2).max(100).optional(),
      price: z.coerce.number().positive('Price must be a positive number'),
    })
    .refine((data) => data.brand || data.model, {
      message: 'Brand or model is required',
      path: ['brand'],
    })
    .transform((data) => ({
      brand: data.brand || data.model,
      price: data.price,
    })),
};

export const createMenuSchema = {
  body: z
    .object({
      name: z.string().trim().min(2).max(100),
      price: z.coerce.number().min(0, 'Price must be 0 or positive').optional(),
      pricePerSeat: z.coerce.number().min(0, 'Price must be 0 or positive').optional(),
    })
    .transform((data) => ({
      name: data.name,
      price:
        data.price !== undefined
          ? data.price
          : data.pricePerSeat !== undefined
            ? data.pricePerSeat
            : 0,
    })),
};

export const setKarnaySurnaySchema = {
  body: z.object({
    available: z.coerce.boolean().default(true),
    price: z.coerce.number().min(0, 'Price must be 0 or positive'),
  }),
};

export const updateSingerSchema = {
  body: z.object({
    name: z.string().trim().min(2).max(100).optional(),
    price: z.coerce.number().positive('Price must be a positive number').optional(),
  }),
};

export const updateCarSchema = {
  body: z
    .object({
      brand: z.string().trim().min(2).max(100).optional(),
      model: z.string().trim().min(2).max(100).optional(),
      price: z.coerce.number().positive('Price must be a positive number').optional(),
    })
    .transform((data) => {
      const result = {};
      if (data.brand || data.model) {
        result.brand = data.brand || data.model;
      }
      if (data.price !== undefined) {
        result.price = data.price;
      }
      return result;
    }),
};

export const updateMenuSchema = {
  body: z
    .object({
      name: z.string().trim().min(2).max(100).optional(),
      price: z.coerce.number().min(0, 'Price must be 0 or positive').optional(),
      pricePerSeat: z.coerce.number().min(0, 'Price must be 0 or positive').optional(),
    })
    .transform((data) => {
      const result = {};
      if (data.name !== undefined) result.name = data.name;
      if (data.price !== undefined) result.price = data.price;
      else if (data.pricePerSeat !== undefined) result.price = data.pricePerSeat;
      return result;
    }),
};
