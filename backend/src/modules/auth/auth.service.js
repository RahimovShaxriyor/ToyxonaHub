import { authRepository } from './auth.repository.js';
import { hashPassword, comparePassword } from '../../shared/utils/password.js';
import { generateAccessToken, generateRefreshToken, hashToken } from '../../shared/utils/token.js';
import { sendOtpEmail } from '../../shared/utils/mailer.js';
import { otpService } from './otp.service.js';
import {
  ConflictError,
  UnauthorizedError,
  NotFoundError,
  BadRequestError,
} from '../../shared/errors/index.js';
import { ROLES } from '../../shared/constants/roles.js';
import { env } from '../../config/env.js';

export class AuthService {
  constructor(repo = authRepository) {
    this.repo = repo;
  }

  sanitizeUser(user) {
    const { passwordHash: _hash, ...sanitized } = user;
    return sanitized;
  }

  async register(data) {
    const existingEmail = await this.repo.findByEmail(data.email);
    if (existingEmail) {
      throw new ConflictError('A user with this email already exists', 'EMAIL_ALREADY_EXISTS');
    }

    const existingUsername = await this.repo.findByUsername(data.username);
    if (existingUsername) {
      throw new ConflictError(
        'A user with this username already exists',
        'USERNAME_ALREADY_EXISTS'
      );
    }

    const hashedPassword = await hashPassword(data.password);

    const user = await this.repo.createUser({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      username: data.username,
      passwordHash: hashedPassword,
      phone: data.phone,
      role: ROLES.USER,
      emailVerified: false,
    });

    const tokens = await this.generateUserTokens(user);

    return {
      user: this.sanitizeUser(user),
      tokens,
    };
  }

  async login({ login, password }) {
    const user = await this.repo.findByLogin(login);
    if (!user) {
      throw new UnauthorizedError('Invalid email/username or password', 'INVALID_CREDENTIALS');
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid email/username or password', 'INVALID_CREDENTIALS');
    }

    // Owner email verification requirement
    if (user.role === ROLES.OWNER && !user.emailVerified) {
      await this.sendOtp(user.email);
      return {
        requiresEmailVerification: true,
        email: user.email,
        message: 'Owner email is not verified. A verification OTP has been sent to your email.',
      };
    }

    const tokens = await this.generateUserTokens(user);

    return {
      user: this.sanitizeUser(user),
      tokens,
    };
  }

  async refreshToken(rawRefreshToken) {
    const tokenHash = hashToken(rawRefreshToken);
    const storedToken = await this.repo.findRefreshToken(tokenHash);

    if (!storedToken || storedToken.revoked || storedToken.expiresAt < new Date()) {
      throw new UnauthorizedError('Invalid or expired refresh token', 'INVALID_REFRESH_TOKEN');
    }

    // Revoke old refresh token for rotation security
    await this.repo.revokeRefreshToken(tokenHash);

    const tokens = await this.generateUserTokens(storedToken.user);

    return {
      tokens,
    };
  }

  async logout(rawRefreshToken) {
    if (rawRefreshToken) {
      const tokenHash = hashToken(rawRefreshToken);
      await this.repo.revokeRefreshToken(tokenHash);
    }
    return { success: true, message: 'Successfully logged out' };
  }

  async sendOtp(email) {
    const user = await this.repo.findByEmail(email);
    if (!user) {
      throw new NotFoundError('User not found with this email', 'USER_NOT_FOUND');
    }

    // Generate 6-digit numeric OTP and store in Redis with TTL
    const otpCode = otpService.generateCode();
    await otpService.storeOtp(email, otpCode);

    // Also persist in database for backward compatibility
    try {
      const codeHash = otpService.hashCode(otpCode);
      const expiresAt = new Date(Date.now() + env.OTP_EXPIRES_MINUTES * 60 * 1000);
      await this.repo.invalidatePreviousOtps(email);
      await this.repo.createOtp({
        email,
        codeHash,
        userId: user.id,
        expiresAt,
      });
    } catch {
      // Non-blocking database fallback log
    }

    await sendOtpEmail(email, otpCode);

    return {
      success: true,
      message: `Verification code sent to ${email}`,
      expiresInMinutes: env.OTP_EXPIRES_MINUTES,
    };
  }

  async verifyOtp({ email, code }) {
    // 1. Primary verification and single-use invalidation via Redis
    try {
      await otpService.verifyOtp(email, code);
    } catch (redisErr) {
      if (redisErr.code === 'OTP_TOO_MANY_ATTEMPTS') {
        throw redisErr;
      }
      // Fallback to database check
      const activeOtp = await this.repo.findLatestActiveOtp(email);
      if (!activeOtp) {
        throw redisErr;
      }

      const codeHash = otpService.hashCode(code);
      if (activeOtp.codeHash !== codeHash) {
        throw new BadRequestError('Invalid verification OTP code', 'INVALID_OTP');
      }

      await this.repo.markOtpUsed(activeOtp.id);
    }

    const user = await this.repo.findByEmail(email);
    if (!user) {
      throw new NotFoundError('User not found', 'USER_NOT_FOUND');
    }

    const updatedUser = await this.repo.updateEmailVerified(user.id, true);
    const tokens = await this.generateUserTokens(updatedUser);

    return {
      message: 'Email verified successfully',
      user: this.sanitizeUser(updatedUser),
      tokens,
    };
  }

  async generateUserTokens(user) {
    const accessToken = generateAccessToken({
      sub: user.id,
      role: user.role,
      email: user.email,
    });

    const rawRefreshToken = generateRefreshToken();
    const tokenHash = hashToken(rawRefreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await this.repo.createRefreshToken({
      tokenHash,
      userId: user.id,
      expiresAt,
    });

    return {
      accessToken,
      refreshToken: rawRefreshToken,
    };
  }
}

export const authService = new AuthService();
