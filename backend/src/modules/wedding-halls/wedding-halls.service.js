import { weddingHallsRepository } from './wedding-halls.repository.js';
import { prisma } from '../../config/database.js';
import { NotFoundError, ForbiddenError, BadRequestError } from '../../shared/errors/index.js';
import { ROLES } from '../../shared/constants/roles.js';
import { HALL_STATUS } from '../../shared/constants/status.js';
import {
  parseBusinessDate,
  formatBusinessDate,
  getTashkentTodayString,
  getDaysInMonth,
} from '../../shared/utils/date.js';
import { buildPaginationMetadata, buildPrismaPagination } from '../../shared/utils/pagination.js';
import { deleteUploadedFile } from '../../shared/utils/file.js';
import { storageService } from '../../shared/storage/storage.service.js';
import { cacheService } from '../../shared/cache/cache.service.js';

export class WeddingHallsService {
  constructor(repo = weddingHallsRepository) {
    this.repo = repo;
  }

  async createHall(user, data, files = []) {
    const hallData = {
      name: data.name,
      district: data.district,
      address: data.address,
      capacity: Number(data.capacity),
      pricePerSeat: data.pricePerSeat,
      phone: data.phone,
    };

    if (user.role === ROLES.OWNER) {
      hallData.ownerId = user.id;
      hallData.status = HALL_STATUS.PENDING;
    } else if (user.role === ROLES.ADMIN) {
      if (data.ownerId) {
        const owner = await prisma.user.findFirst({
          where: { id: data.ownerId, role: ROLES.OWNER },
        });
        if (!owner) {
          throw new BadRequestError('Specified owner does not exist or is not an OWNER');
        }
        hallData.ownerId = data.ownerId;
      }
      hallData.status = HALL_STATUS.APPROVED;
    }

    const createdHall = await this.repo.create(hallData);

    // Attach uploaded images if provided
    if (files && files.length > 0) {
      const uploadPromises = files.map((file) =>
        storageService.uploadFile(file, `wedding-halls/${createdHall.id}`)
      );
      const uploaded = await Promise.all(uploadPromises);
      const urls = uploaded.map((u) => u.url);
      await this.repo.addImages(createdHall.id, urls);
    }

    await cacheService.delByPrefix('hall:');
    return this.repo.findById(createdHall.id);
  }

  async updateHall(user, hallId, updateData) {
    const hall = await this.repo.findById(hallId);
    if (!hall) {
      throw new NotFoundError('Wedding hall not found', 'WEDDING_HALL_NOT_FOUND');
    }

    if (user.role === ROLES.OWNER) {
      if (hall.ownerId !== user.id) {
        throw new ForbiddenError('You can only edit your own wedding hall', 'NOT_HALL_OWNER');
      }
      // Owner cannot change status or reassign ownership
      delete updateData.status;
      delete updateData.ownerId;
    }

    const updated = await this.repo.update(hallId, updateData);
    await cacheService.delByPrefix('hall:');
    return updated;
  }

  async updateStatus(hallId, status) {
    const hall = await this.repo.findById(hallId);
    if (!hall) {
      throw new NotFoundError('Wedding hall not found', 'WEDDING_HALL_NOT_FOUND');
    }

    const updated = await this.repo.update(hallId, { status });
    await cacheService.delByPrefix('hall:');
    return updated;
  }

  async assignOwner(hallId, ownerId) {
    const hall = await this.repo.findById(hallId);
    if (!hall) {
      throw new NotFoundError('Wedding hall not found', 'WEDDING_HALL_NOT_FOUND');
    }

    const owner = await prisma.user.findFirst({
      where: { id: ownerId, role: ROLES.OWNER },
    });
    if (!owner) {
      throw new BadRequestError('User does not exist or does not have OWNER role');
    }

    const updated = await this.repo.update(hallId, { ownerId });
    await cacheService.delByPrefix('hall:');
    return updated;
  }

  async deleteHall(hallId) {
    const hall = await this.repo.findById(hallId);
    if (!hall) {
      throw new NotFoundError('Wedding hall not found', 'WEDDING_HALL_NOT_FOUND');
    }

    if (hall.images && hall.images.length > 0) {
      for (const img of hall.images) {
        await storageService.deleteFile(img.url);
        await deleteUploadedFile(img.url);
      }
    }

    await this.repo.delete(hallId);
    await cacheService.delByPrefix('hall:');
    return { success: true, message: 'Wedding hall successfully deleted' };
  }

  async getHallById(user, hallId) {
    const cacheKey = `hall:detail:${hallId}:${user?.id || user?.role || 'public'}`;
    const cached = await cacheService.get(cacheKey);
    if (cached) {
      return cached;
    }

    const hall = await this.repo.findById(hallId);
    if (!hall) {
      throw new NotFoundError('Wedding hall not found', 'WEDDING_HALL_NOT_FOUND');
    }

    // USER sees only APPROVED halls
    if (hall.status !== HALL_STATUS.APPROVED) {
      const isAdmin = user?.role === ROLES.ADMIN;
      const isOwner = user?.role === ROLES.OWNER && hall.ownerId === user.id;

      if (!isAdmin && !isOwner) {
        throw new NotFoundError('Wedding hall not found', 'WEDDING_HALL_NOT_FOUND');
      }
    }

    await cacheService.set(cacheKey, hall, 300);
    return hall;
  }

  async listHalls(user, query) {
    const cacheKey = `hall:list:${user?.id || user?.role || 'public'}:${JSON.stringify(query)}`;
    const cached = await cacheService.get(cacheKey);
    if (cached) {
      return cached;
    }

    const { page, limit } = query;
    const { skip, take } = buildPrismaPagination({ page, limit });

    const andConditions = [];

    // Role-based visibility
    if (user?.role === ROLES.ADMIN) {
      if (query.status) {
        andConditions.push({ status: query.status });
      }
      if (query.ownerId) {
        andConditions.push({ ownerId: query.ownerId });
      }
    } else if (user?.role === ROLES.OWNER) {
      if (query.ownerId) {
        andConditions.push({ ownerId: query.ownerId });
        if (query.ownerId === user.id) {
          if (query.status) {
            andConditions.push({ status: query.status });
          }
        } else {
          andConditions.push({ status: HALL_STATUS.APPROVED });
        }
      } else {
        // Owner sees APPROVED halls OR any halls owned by themselves
        andConditions.push({
          OR: [{ status: HALL_STATUS.APPROVED }, { ownerId: user.id }],
        });
      }
    } else {
      andConditions.push({ status: HALL_STATUS.APPROVED });
    }

    if (query.district) {
      andConditions.push({ district: query.district });
    }

    if (query.minCapacity || query.maxCapacity) {
      const cap = {};
      if (query.minCapacity) cap.gte = Number(query.minCapacity);
      if (query.maxCapacity) cap.lte = Number(query.maxCapacity);
      andConditions.push({ capacity: cap });
    }

    if (query.minPrice || query.maxPrice) {
      const price = {};
      if (query.minPrice) price.gte = query.minPrice;
      if (query.maxPrice) price.lte = query.maxPrice;
      andConditions.push({ pricePerSeat: price });
    }

    if (query.search) {
      andConditions.push({
        OR: [
          { name: { contains: query.search, mode: 'insensitive' } },
          { address: { contains: query.search, mode: 'insensitive' } },
        ],
      });
    }

    const where = andConditions.length > 0 ? { AND: andConditions } : {};

    const sortBy = query.sortBy || 'createdAt';
    const order = query.order || 'desc';
    const orderBy = { [sortBy]: order };

    const { total, items } = await this.repo.list({ where, orderBy, skip, take });

    const result = {
      data: items,
      pagination: buildPaginationMetadata({ page, limit, total }),
    };

    await cacheService.set(cacheKey, result, 300);
    return result;
  }

  async getAvailability(user, hallId, { year, month }) {
    const hall = await this.repo.findById(hallId);
    if (!hall) {
      throw new NotFoundError('Wedding hall not found', 'WEDDING_HALL_NOT_FOUND');
    }

    if (hall.status !== HALL_STATUS.APPROVED) {
      const isAdmin = user?.role === ROLES.ADMIN;
      const isOwner = user?.role === ROLES.OWNER && hall.ownerId === user?.id;
      if (!isAdmin && !isOwner) {
        throw new NotFoundError('Wedding hall not found', 'WEDDING_HALL_NOT_FOUND');
      }
    }

    const startDate = parseBusinessDate(`${year}-${String(month).padStart(2, '0')}-01`);
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = parseBusinessDate(
      `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`
    );

    const bookings = await this.repo.findBookingsByDateRange(hallId, startDate, endDate);

    const bookedMap = new Map();
    bookings.forEach((b) => {
      const dateStr = formatBusinessDate(b.bookingDate);
      bookedMap.set(dateStr, b);
    });

    const todayStr = getTashkentTodayString();
    const days = getDaysInMonth(year, month);
    const isAdmin = user?.role === ROLES.ADMIN;

    const calendar = days.map((dateStr) => {
      let status = 'AVAILABLE';
      let bookingInfo = null;

      if (dateStr < todayStr) {
        status = 'PAST';
      } else if (bookedMap.has(dateStr)) {
        status = 'BOOKED';
        const b = bookedMap.get(dateStr);
        if (isAdmin) {
          bookingInfo = {
            bookingId: b.id,
            firstName: b.firstName,
            lastName: b.lastName,
            customerName: `${b.firstName} ${b.lastName}`,
            phone: b.phone,
            guestCount: b.guestCount,
          };
        }
      }

      const result = {
        date: dateStr,
        status,
      };

      if (isAdmin && bookingInfo) {
        result.booking = bookingInfo;
      }

      return result;
    });

    return calendar;
  }

  async uploadImages(user, hallId, files = []) {
    const hall = await this.repo.findById(hallId);
    if (!hall) {
      throw new NotFoundError('Wedding hall not found', 'WEDDING_HALL_NOT_FOUND');
    }

    if (user.role === ROLES.OWNER && hall.ownerId !== user.id) {
      throw new ForbiddenError(
        'You can only manage images for your own wedding hall',
        'NOT_HALL_OWNER'
      );
    }

    if (!files || files.length === 0) {
      throw new BadRequestError('At least one image file is required');
    }

    const uploadPromises = files.map((file) =>
      storageService.uploadFile(file, `wedding-halls/${hallId}`)
    );
    const uploaded = await Promise.all(uploadPromises);
    const urls = uploaded.map((u) => u.url);
    await this.repo.addImages(hallId, urls);
    await cacheService.delByPrefix('hall:');

    return this.repo.findById(hallId);
  }

  async deleteImage(user, hallId, imageId) {
    const hall = await this.repo.findById(hallId);
    if (!hall) {
      throw new NotFoundError('Wedding hall not found', 'WEDDING_HALL_NOT_FOUND');
    }

    if (user.role === ROLES.OWNER && hall.ownerId !== user.id) {
      throw new ForbiddenError(
        'You can only delete images from your own wedding hall',
        'NOT_HALL_OWNER'
      );
    }

    const image = await this.repo.findImageById(imageId);
    if (!image || image.weddingHallId !== hallId) {
      throw new NotFoundError('Image not found in this wedding hall');
    }

    await storageService.deleteFile(image.url);
    await deleteUploadedFile(image.url);
    await this.repo.deleteImage(imageId);
    await cacheService.delByPrefix('hall:');

    return { success: true, message: 'Image successfully deleted' };
  }

  async setPrimaryImage(user, hallId, imageId) {
    const hall = await this.repo.findById(hallId);
    if (!hall) {
      throw new NotFoundError('Wedding hall not found', 'WEDDING_HALL_NOT_FOUND');
    }

    if (user.role === ROLES.OWNER && hall.ownerId !== user.id) {
      throw new ForbiddenError(
        'You can only manage images for your own wedding hall',
        'NOT_HALL_OWNER'
      );
    }

    const image = await this.repo.findImageById(imageId);
    if (!image || image.weddingHallId !== hallId) {
      throw new NotFoundError('Image not found in this wedding hall');
    }

    await this.repo.setPrimaryImage(hallId, imageId);
    await cacheService.delByPrefix('hall:');

    return { success: true, message: 'Primary image successfully updated' };
  }
}

export const weddingHallsService = new WeddingHallsService();
