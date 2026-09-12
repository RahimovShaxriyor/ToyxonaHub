import { servicesRepository } from './services.repository.js';
import { weddingHallsRepository } from '../wedding-halls/wedding-halls.repository.js';
import { NotFoundError, ForbiddenError } from '../../shared/errors/index.js';
import { ROLES } from '../../shared/constants/roles.js';
import { deleteUploadedFile } from '../../shared/utils/file.js';
import { storageService } from '../../shared/storage/storage.service.js';
import { cacheService } from '../../shared/cache/cache.service.js';

export class ServicesService {
  constructor(repo = servicesRepository, hallRepo = weddingHallsRepository) {
    this.repo = repo;
    this.hallRepo = hallRepo;
  }

  async verifyHallAccess(user, hallId) {
    const hall = await this.hallRepo.findById(hallId);
    if (!hall) {
      throw new NotFoundError('Wedding hall not found', 'WEDDING_HALL_NOT_FOUND');
    }

    if (user.role === ROLES.OWNER && hall.ownerId !== user.id) {
      throw new ForbiddenError(
        'You do not have permission to manage services for this wedding hall',
        'NOT_HALL_OWNER'
      );
    }

    return hall;
  }

  async addSinger(user, hallId, data, file) {
    await this.verifyHallAccess(user, hallId);

    let imageUrl = null;
    if (file) {
      const uploaded = await storageService.uploadFile(file, `singers/${hallId}`);
      imageUrl = uploaded.url;
    }

    const singer = await this.repo.addSinger({
      weddingHallId: hallId,
      name: data.name,
      price: data.price,
      image: imageUrl,
    });

    await cacheService.delByPrefix('hall:');
    return singer;
  }

  async updateSinger(user, hallId, singerId, data, file) {
    await this.verifyHallAccess(user, hallId);
    const singer = await this.repo.findSingerById(singerId);
    if (!singer || singer.weddingHallId !== hallId) {
      throw new NotFoundError('Singer not found in this wedding hall');
    }

    const updateData = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.price !== undefined) updateData.price = data.price;
    if (file) {
      if (singer.image) {
        await storageService.deleteFile(singer.image);
        await deleteUploadedFile(singer.image);
      }
      const uploaded = await storageService.uploadFile(file, `singers/${hallId}`);
      updateData.image = uploaded.url;
    }

    const updated = await this.repo.updateSinger(singerId, updateData);
    await cacheService.delByPrefix('hall:');
    return updated;
  }

  async deleteSinger(user, hallId, singerId) {
    await this.verifyHallAccess(user, hallId);
    const singer = await this.repo.findSingerById(singerId);
    if (!singer || singer.weddingHallId !== hallId) {
      throw new NotFoundError('Singer not found in this wedding hall');
    }

    if (singer.image) {
      await storageService.deleteFile(singer.image);
      await deleteUploadedFile(singer.image);
    }
    await this.repo.deleteSinger(singerId);
    await cacheService.delByPrefix('hall:');
    return { success: true, message: 'Singer successfully removed' };
  }

  async addCar(user, hallId, data, file) {
    await this.verifyHallAccess(user, hallId);

    let imageUrl = null;
    if (file) {
      const uploaded = await storageService.uploadFile(file, `cars/${hallId}`);
      imageUrl = uploaded.url;
    }

    const car = await this.repo.addCar({
      weddingHallId: hallId,
      brand: data.brand,
      price: data.price,
      image: imageUrl,
    });

    await cacheService.delByPrefix('hall:');
    return car;
  }

  async updateCar(user, hallId, carId, data, file) {
    await this.verifyHallAccess(user, hallId);
    const car = await this.repo.findCarById(carId);
    if (!car || car.weddingHallId !== hallId) {
      throw new NotFoundError('Car not found in this wedding hall');
    }

    const updateData = {};
    if (data.brand !== undefined) updateData.brand = data.brand;
    if (data.price !== undefined) updateData.price = data.price;
    if (file) {
      if (car.image) {
        await storageService.deleteFile(car.image);
        await deleteUploadedFile(car.image);
      }
      const uploaded = await storageService.uploadFile(file, `cars/${hallId}`);
      updateData.image = uploaded.url;
    }

    const updated = await this.repo.updateCar(carId, updateData);
    await cacheService.delByPrefix('hall:');
    return updated;
  }

  async deleteCar(user, hallId, carId) {
    await this.verifyHallAccess(user, hallId);
    const car = await this.repo.findCarById(carId);
    if (!car || car.weddingHallId !== hallId) {
      throw new NotFoundError('Car not found in this wedding hall');
    }

    if (car.image) {
      await storageService.deleteFile(car.image);
      await deleteUploadedFile(car.image);
    }
    await this.repo.deleteCar(carId);
    await cacheService.delByPrefix('hall:');
    return { success: true, message: 'Car successfully removed' };
  }

  async addMenuOption(user, hallId, data) {
    await this.verifyHallAccess(user, hallId);

    const menu = await this.repo.addMenuOption({
      weddingHallId: hallId,
      name: data.name,
      price: data.price,
    });

    await cacheService.delByPrefix('hall:');
    return menu;
  }

  async updateMenuOption(user, hallId, menuId, data) {
    await this.verifyHallAccess(user, hallId);
    const menu = await this.repo.findMenuOptionById(menuId);
    if (!menu || menu.weddingHallId !== hallId) {
      throw new NotFoundError('Menu option not found in this wedding hall');
    }

    const updateData = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.price !== undefined) updateData.price = data.price;

    const updated = await this.repo.updateMenuOption(menuId, updateData);
    await cacheService.delByPrefix('hall:');
    return updated;
  }

  async deleteMenuOption(user, hallId, menuId) {
    await this.verifyHallAccess(user, hallId);
    const menu = await this.repo.findMenuOptionById(menuId);
    if (!menu || menu.weddingHallId !== hallId) {
      throw new NotFoundError('Menu option not found in this wedding hall');
    }

    await this.repo.deleteMenuOption(menuId);
    await cacheService.delByPrefix('hall:');
    return { success: true, message: 'Menu option successfully removed' };
  }

  async setKarnaySurnay(user, hallId, data) {
    await this.verifyHallAccess(user, hallId);

    const result = await this.repo.upsertKarnaySurnay(hallId, {
      available: data.available,
      price: data.price,
    });

    await cacheService.delByPrefix('hall:');
    return result;
  }
}

export const servicesService = new ServicesService();
