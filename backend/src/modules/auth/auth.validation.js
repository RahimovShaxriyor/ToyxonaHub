import { z } from 'zod';

const phoneRegex = /^\+?[0-9]{9,15}$/;

export const registerSchema = {
  body: z.object({
    firstName: z.string().trim().min(2, 'First name must be at least 2 characters').max(50),
    lastName: z.string().trim().min(2, 'Last name must be at least 2 characters').max(50),
    email: z.string().trim().toLowerCase().email('Invalid email address'),
    username: z
      .string()
      .trim()
      .min(3, 'Username must be at least 3 characters')
      .max(30)
      .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
    password: z.string().min(6, 'Password must be at least 6 characters').max(100),
    phone: z.string().trim().regex(phoneRegex, 'Invalid phone number format (e.g. +998901234567)'),
  }),
};

export const loginSchema = {
  body: z.object({
    login: z.string().trim().min(1, 'Email or username is required'),
    password: z.string().min(1, 'Password is required'),
  }),
};

export const refreshTokenSchema = {
  body: z.object({
    refreshToken: z.string().min(1, 'Refresh token is required'),
  }),
};

export const sendOtpSchema = {
  body: z.object({
    email: z.string().trim().toLowerCase().email('Invalid email address'),
  }),
};

export const verifyOtpSchema = {
  body: z.object({
    email: z.string().trim().toLowerCase().email('Invalid email address'),
    code: z
      .string()
      .trim()
      .length(6, 'OTP code must be exactly 6 digits')
      .regex(/^\d{6}$/, 'OTP code must contain only numbers'),
  }),
};
