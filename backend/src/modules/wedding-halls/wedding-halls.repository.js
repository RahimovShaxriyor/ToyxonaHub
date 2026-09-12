import { prisma } from '../../config/database.js';

export class WeddingHallsRepository {
  async create(data) {
    return prisma.weddingHall.create({
      data,
      include: {
        images: true,
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
      },
    });
  }

  async findById(id) {
    return prisma.weddingHall.findUnique({
      where: { id },
      include: {
        images: true,
        singers: true,
        cars: true,
        menuOptions: true,
        karnaySurnay: true,
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
      },
    });
  }

  async update(id, data) {
    return prisma.weddingHall.update({
      where: { id },
      data,
      include: {
        images: true,
        singers: true,
        cars: true,
        menuOptions: true,
        karnaySurnay: true,
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
      },
    });
  }

  async delete(id) {
    return prisma.weddingHall.delete({
      where: { id },
    });
  }

  async list({ where, orderBy, skip, take }) {
    const [total, items] = await Promise.all([
      prisma.weddingHall.count({ where }),
      prisma.weddingHall.findMany({
        where,
        orderBy,
        skip,
        take,
        include: {
          images: true,
          karnaySurnay: true,
          _count: {
            select: {
              singers: true,
              cars: true,
              menuOptions: true,
              bookings: true,
            },
          },
          owner: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      }),
    ]);

    return { total, items };
  }

  async addImages(weddingHallId, urls) {
    const existingPrimary = await prisma.weddingHallImage.findFirst({
      where: { weddingHallId, isPrimary: true },
    });
    return prisma.weddingHallImage.createMany({
      data: urls.map((url, index) => ({
        weddingHallId,
        url,
        isPrimary: !existingPrimary && index === 0,
      })),
    });
  }

  async findImageById(id) {
    return prisma.weddingHallImage.findUnique({
      where: { id },
    });
  }

  async deleteImage(id) {
    return prisma.weddingHallImage.delete({
      where: { id },
    });
  }

  async setPrimaryImage(weddingHallId, imageId) {
    return prisma.$transaction([
      prisma.weddingHallImage.updateMany({
        where: { weddingHallId },
        data: { isPrimary: false },
      }),
      prisma.weddingHallImage.update({
        where: { id: imageId },
        data: { isPrimary: true },
      }),
    ]);
  }

  async findBookingsByDateRange(weddingHallId, startDate, endDate) {
    return prisma.booking.findMany({
      where: {
        weddingHallId,
        status: 'ACTIVE',
        bookingDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        id: true,
        bookingDate: true,
        guestCount: true,
        firstName: true,
        lastName: true,
        phone: true,
        status: true,
      },
    });
  }
}

export const weddingHallsRepository = new WeddingHallsRepository();
