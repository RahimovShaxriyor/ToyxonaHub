import crypto from 'crypto';
import { redisClient } from '../../config/redis.js';
import { env } from '../../config/env.js';
import { BadRequestError } from '../../shared/errors/index.js';

export class OtpService {
  constructor(client = redisClient) {
    this.client = client;
  }

  getOtpKey(email) {
    return `otp:email:${email.toLowerCase().trim()}`;
  }

  generateCode() {
    return String(Math.floor(100000 + Math.random() * 900000));
  }

  hashCode(code) {
    return crypto.createHash('sha256').update(code).digest('hex');
  }

  async generateOtp(email) {
    const code = this.generateCode();
    await this.storeOtp(email, code);
    return { code };
  }

  async storeOtp(email, code) {
    const key = this.getOtpKey(email);
    const codeHash = this.hashCode(code);
    const payload = JSON.stringify({
      codeHash,
      attempts: 0,
      createdAt: Date.now(),
    });
    await this.client.set(key, payload, 'EX', env.OTP_EXPIRES_SECONDS);
  }

  async verifyOtp(email, code) {
    const key = this.getOtpKey(email);
    const raw = await this.client.get(key);
    if (!raw) {
      throw new BadRequestError('OTP code has expired or was not requested', 'INVALID_OTP');
    }

    const data = JSON.parse(raw);
    if (data.attempts >= env.OTP_MAX_ATTEMPTS) {
      await this.client.del(key);
      throw new BadRequestError(
        'Too many failed OTP attempts. Please request a new OTP code.',
        'OTP_TOO_MANY_ATTEMPTS'
      );
    }

    const inputHash = this.hashCode(code);
    if (data.codeHash !== inputHash) {
      data.attempts += 1;
      if (data.attempts >= env.OTP_MAX_ATTEMPTS) {
        await this.client.del(key);
        throw new BadRequestError(
          'Too many failed OTP attempts. Please request a new OTP code.',
          'OTP_TOO_MANY_ATTEMPTS'
        );
      }
      const ttl = await this.client.ttl(key);
      if (ttl > 0) {
        await this.client.set(key, JSON.stringify(data), 'EX', ttl);
      }
      throw new BadRequestError('Invalid verification OTP code', 'INVALID_OTP');
    }

    // Success -> delete OTP key
    await this.client.del(key);
    return true;
  }
}

export const otpService = new OtpService();
