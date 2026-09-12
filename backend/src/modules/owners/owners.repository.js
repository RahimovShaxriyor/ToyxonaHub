import { prisma } from '../../config/database.js';
import { ROLES } from '../../shared/constants/roles.js';

export class OwnersRepository {
  async createOwner(data) {
    return prisma.user.create({
      data: {
        ...data,
        role: ROLES.OWNER,
        emailVerified: false,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        username: true,
        phone: true,
        role: true,
        emailVerified: true,
        createdAt: true,
      },
    });
  }

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

  async findById(id) {
    return prisma.user.findFirst({
      where: { id, role: ROLES.OWNER },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        username: true,
        phone: true,
        role: true,
        emailVerified: true,
        ownedHalls: {
          select: {
            id: true,
            name: true,
            status: true,
            district: true,
          },
        },
        createdAt: true,
      },
    });
  }

  async listOwners({ skip, take }) {
    const where = { role: ROLES.OWNER };

    const [total, items] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          username: true,
          phone: true,
          role: true,
          emailVerified: true,
          _count: {
            select: { ownedHalls: true },
          },
          createdAt: true,
        },
      }),
    ]);

    return { total, items };
  }
}

export const ownersRepository = new OwnersRepository();
