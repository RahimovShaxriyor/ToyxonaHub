import { redisClient } from '../../config/redis.js';
import { env } from '../../config/env.js';

export class CacheService {
  constructor(client = redisClient) {
    this.client = client;
  }

  async get(key) {
    try {
      const data = await this.client.get(key);
      if (!data) return null;
      return JSON.parse(data);
    } catch (err) {
      if (env.NODE_ENV !== 'test') {
        console.warn(`[Cache] Error reading key "${key}":`, err.message);
      }
      return null;
    }
  }

  async set(key, value, ttlSeconds = env.CACHE_TTL_SECONDS) {
    try {
      const serialized = JSON.stringify(value);
      if (ttlSeconds > 0) {
        await this.client.set(key, serialized, 'EX', ttlSeconds);
      } else {
        await this.client.set(key, serialized);
      }
      return true;
    } catch (err) {
      if (env.NODE_ENV !== 'test') {
        console.warn(`[Cache] Error setting key "${key}":`, err.message);
      }
      return false;
    }
  }

  async del(key) {
    try {
      await this.client.del(key);
      return true;
    } catch (err) {
      if (env.NODE_ENV !== 'test') {
        console.warn(`[Cache] Error deleting key "${key}":`, err.message);
      }
      return false;
    }
  }

  async delByPrefix(prefix) {
    try {
      let cursor = '0';
      const pattern = `${prefix}*`;
      do {
        const [nextCursor, keys] = await this.client.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
        cursor = nextCursor;
        if (keys && keys.length > 0) {
          await this.client.del(...keys);
        }
      } while (cursor !== '0');
      return true;
    } catch (err) {
      if (env.NODE_ENV !== 'test') {
        console.warn(`[Cache] Error deleting keys with prefix "${prefix}":`, err.message);
      }
      return false;
    }
  }
}

export const cacheService = new CacheService();
