import { prisma } from '../../config/database.js';

export class ServicesRepository {
  async addSinger(data) {
    return prisma.singer.create({ data });
  }

  async findSingerById(id) {
    return prisma.singer.findUnique({ where: { id } });
  }

  async deleteSinger(id) {
    return prisma.singer.delete({ where: { id } });
  }

  async addCar(data) {
    return prisma.car.create({ data });
  }

  async findCarById(id) {
    return prisma.car.findUnique({ where: { id } });
  }

  async deleteCar(id) {
    return prisma.car.delete({ where: { id } });
  }

  async addMenuOption(data) {
    return prisma.menuOption.create({ data });
  }

  async findMenuOptionById(id) {
    return prisma.menuOption.findUnique({ where: { id } });
  }

  async deleteMenuOption(id) {
    return prisma.menuOption.delete({ where: { id } });
  }

  async updateSinger(id, data) {
    return prisma.singer.update({ where: { id }, data });
  }

  async updateCar(id, data) {
    return prisma.car.update({ where: { id }, data });
  }

  async updateMenuOption(id, data) {
    return prisma.menuOption.update({ where: { id }, data });
  }

  async upsertKarnaySurnay(weddingHallId, data) {
    return prisma.karnaySurnayService.upsert({
      where: { weddingHallId },
      update: {
        available: data.available,
        price: data.price,
      },
      create: {
        weddingHallId,
        available: data.available,
        price: data.price,
      },
    });
  }
}

export const servicesRepository = new ServicesRepository();
