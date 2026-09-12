import Redis from 'ioredis';
import { env } from './env.js';

let isConnected = false;

export const redisClient = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: 3,
  retryStrategy: (times) => {
    if (env.NODE_ENV === 'test' && times > 2) {
      return null; // Stop retrying quickly during tests if Redis is not running
    }
    const delay = Math.min(times * 100, 3000);
    return delay;
  },
  enableOfflineQueue: true,
  lazyConnect: false,
});

redisClient.on('connect', () => {
  isConnected = true;
  if (env.NODE_ENV !== 'test') {
    console.log('[Redis] Connected to Redis server successfully.');
  }
});

redisClient.on('ready', () => {
  isConnected = true;
});

redisClient.on('error', (err) => {
  isConnected = false;
  if (env.NODE_ENV !== 'test') {
    console.warn('[Redis] Connection warning/error:', err.message);
  }
});

redisClient.on('close', () => {
  isConnected = false;
});

export const isRedisConnected = () => isConnected;

export const closeRedis = async () => {
  try {
    await redisClient.quit();
  } catch {
    redisClient.disconnect();
  }
};
