import { prisma } from '../../config/database.js';

export class AuthRepository {
  async findByEmail(email) {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  async findByUsername(username) {
    return prisma.user.findUnique({
      where: { username },
    });
  }

  async findByLogin(login) {
    return prisma.user.findFirst({
      where: {
        OR: [{ email: login }, { username: login }],
      },
    });
  }

  async findById(id) {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  async createUser(userData) {
    return prisma.user.create({
      data: userData,
    });
  }

  async updateEmailVerified(userId, emailVerified = true) {
    return prisma.user.update({
      where: { id: userId },
      data: { emailVerified },
    });
  }

  async createRefreshToken({ tokenHash, userId, expiresAt }) {
    return prisma.refreshToken.create({
      data: {
        tokenHash,
        userId,
        expiresAt,
      },
    });
  }

  async findRefreshToken(tokenHash) {
    return prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });
  }

  async revokeRefreshToken(tokenHash) {
    return prisma.refreshToken.updateMany({
      where: { tokenHash },
      data: { revoked: true },
    });
  }

  async revokeAllUserRefreshTokens(userId) {
    return prisma.refreshToken.updateMany({
      where: { userId },
      data: { revoked: true },
    });
  }

  async createOtp({ email, codeHash, userId, expiresAt }) {
    return prisma.otpCode.create({
      data: {
        email,
        codeHash,
        userId,
        expiresAt,
      },
    });
  }

  async findLatestActiveOtp(email) {
    return prisma.otpCode.findFirst({
      where: {
        email,
        isUsed: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async markOtpUsed(id) {
    return prisma.otpCode.update({
      where: { id },
      data: { isUsed: true },
    });
  }

  async invalidatePreviousOtps(email) {
    return prisma.otpCode.updateMany({
      where: { email, isUsed: false },
      data: { isUsed: true },
    });
  }
}

export const authRepository = new AuthRepository();
