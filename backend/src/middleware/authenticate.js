import { verifyAccessToken } from '../shared/utils/token.js';
import { UnauthorizedError } from '../shared/errors/index.js';
import { prisma } from '../config/database.js';

export const authenticate = async (req, _res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Authentication token is missing');
    }

    const token = authHeader.split(' ')[1];
    let payload;
    try {
      payload = verifyAccessToken(token);
    } catch {
      throw new UnauthorizedError('Invalid or expired authentication token');
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        username: true,
        role: true,
        phone: true,
        emailVerified: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new UnauthorizedError('User account associated with this token no longer exists');
    }

    req.user = user;
    return next();
  } catch (err) {
    return next(err);
  }
};

export const optionalAuthenticate = async (req, _res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = null;
      return next();
    }

    const token = authHeader.split(' ')[1];
    try {
      const payload = verifyAccessToken(token);
      const user = await prisma.user.findUnique({
        where: { id: payload.sub },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          username: true,
          role: true,
          phone: true,
          emailVerified: true,
        },
      });
      req.user = user || null;
    } catch {
      req.user = null;
    }
    return next();
  } catch {
    req.user = null;
    return next();
  }
};
