import dotenv from 'dotenv';
import { z } from 'zod';

// Load .env according to NODE_ENV
if (process.env.NODE_ENV === 'test') {
  dotenv.config({ path: '.env.test' });
} else {
  dotenv.config();
}

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(5000),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  JWT_ACCESS_SECRET: z.string().min(16, 'JWT_ACCESS_SECRET must be at least 16 chars'),
  JWT_REFRESH_SECRET: z.string().min(16, 'JWT_REFRESH_SECRET must be at least 16 chars'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  SMTP_HOST: z.string().optional().default(''),
  SMTP_PORT: z.coerce.number().optional().default(587),
  SMTP_SECURE: z
    .preprocess((val) => val === 'true' || val === true, z.boolean())
    .default(false),
  SMTP_USER: z.string().optional().default(''),
  SMTP_PASS: z.string().optional().default(''),
  SMTP_FROM: z.string().default('ToyxonaHub <no-reply@toyxonahub.uz>'),
  FRONTEND_URL: z.string().default('http://localhost:3000'),
  OTP_EXPIRES_MINUTES: z.coerce.number().default(5),
  OTP_EXPIRES_SECONDS: z.coerce.number().default(300),
  OTP_MAX_ATTEMPTS: z.coerce.number().default(5),
  UPLOAD_DIR: z.string().default('./uploads'),
  MAX_FILE_SIZE_MB: z.coerce.number().default(5),
  // Redis Configuration
  REDIS_URL: z.string().default('redis://localhost:6379'),
  CACHE_TTL_SECONDS: z.coerce.number().default(300),
  // MinIO / S3 Configuration
  S3_ENDPOINT: z.string().default('http://localhost:9000'),
  S3_PUBLIC_URL: z.string().default(''),
  S3_REGION: z.string().default('us-east-1'),
  S3_BUCKET: z.string().default('toyxonahub-images'),
  S3_ACCESS_KEY: z.string().default('toyxona'),
  S3_SECRET_KEY: z.string().default('change_me'),
  S3_FORCE_PATH_STYLE: z
    .preprocess((val) => val === 'true' || val === true, z.boolean())
    .default(true),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;
