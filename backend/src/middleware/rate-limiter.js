import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { redisClient } from '../config/redis.js';
import { env } from '../config/env.js';

const createRedisStore = (prefix) =>
  new RedisStore({
    sendCommand: (...args) => redisClient.call(...args),
    prefix: `rl:${prefix}:`,
  });

const shouldSkipRateLimit = (req) => {
  if (env.NODE_ENV === 'test' && !req.headers['x-test-rate-limit']) {
    return true;
  }
  return false;
};

// General auth limiter
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  store: createRedisStore('auth'),
  skip: shouldSkipRateLimit,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many authentication requests from this IP, please try again later',
    },
  },
});

// Login limiter: 10 attempts / minute
export const loginLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  store: createRedisStore('login'),
  skip: shouldSkipRateLimit,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many login attempts, please try again after 1 minute',
    },
  },
});

// Register limiter: 10 registrations / 15 minutes
export const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  store: createRedisStore('register'),
  skip: shouldSkipRateLimit,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many accounts created from this IP, please try again after 15 minutes',
    },
  },
});

// OTP send limiter: 5 requests / 15 minutes
export const otpSendLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  store: createRedisStore('otp-send'),
  skip: shouldSkipRateLimit,
  keyGenerator: (req) => {
    const email = req.body?.email ? String(req.body.email).toLowerCase().trim() : '';
    return `${req.ip}_${email}`;
  },
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many OTP requests for this email, please try again after 15 minutes',
    },
  },
});

// OTP verify limiter: 10 requests / 15 minutes
export const otpVerifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  store: createRedisStore('otp-verify'),
  skip: shouldSkipRateLimit,
  keyGenerator: (req) => {
    const email = req.body?.email ? String(req.body.email).toLowerCase().trim() : '';
    return `${req.ip}_${email}`;
  },
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many OTP verification attempts, please try again later',
    },
  },
});

// Alias for backwards compatibility
export const otpLimiter = otpSendLimiter;
