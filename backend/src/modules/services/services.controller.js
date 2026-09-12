import { servicesService } from './services.service.js';

export class ServicesController {
  constructor(service = servicesService) {
    this.service = service;
  }

  addSinger = async (req, res, next) => {
    try {
      const singer = await this.service.addSinger(req.user, req.params.hallId, req.body, req.file);
      return res.status(201).json({ success: true, data: singer });
    } catch (err) {
      return next(err);
    }
  };

  updateSinger = async (req, res, next) => {
    try {
      const singer = await this.service.updateSinger(
        req.user,
        req.params.hallId,
        req.params.singerId,
        req.body,
        req.file
      );
      return res.status(200).json({ success: true, data: singer });
    } catch (err) {
      return next(err);
    }
  };

  deleteSinger = async (req, res, next) => {
    try {
      const result = await this.service.deleteSinger(
        req.user,
        req.params.hallId,
        req.params.singerId
      );
      return res.status(200).json(result);
    } catch (err) {
      return next(err);
    }
  };

  addCar = async (req, res, next) => {
    try {
      const car = await this.service.addCar(req.user, req.params.hallId, req.body, req.file);
      return res.status(201).json({ success: true, data: car });
    } catch (err) {
      return next(err);
    }
  };

  updateCar = async (req, res, next) => {
    try {
      const car = await this.service.updateCar(
        req.user,
        req.params.hallId,
        req.params.carId,
        req.body,
        req.file
      );
      return res.status(200).json({ success: true, data: car });
    } catch (err) {
      return next(err);
    }
  };

  deleteCar = async (req, res, next) => {
    try {
      const result = await this.service.deleteCar(req.user, req.params.hallId, req.params.carId);
      return res.status(200).json(result);
    } catch (err) {
      return next(err);
    }
  };

  addMenuOption = async (req, res, next) => {
    try {
      const menu = await this.service.addMenuOption(req.user, req.params.hallId, req.body);
      return res.status(201).json({ success: true, data: menu });
    } catch (err) {
      return next(err);
    }
  };

  updateMenuOption = async (req, res, next) => {
    try {
      const menu = await this.service.updateMenuOption(
        req.user,
        req.params.hallId,
        req.params.menuId,
        req.body
      );
      return res.status(200).json({ success: true, data: menu });
    } catch (err) {
      return next(err);
    }
  };

  deleteMenuOption = async (req, res, next) => {
    try {
      const result = await this.service.deleteMenuOption(
        req.user,
        req.params.hallId,
        req.params.menuId
      );
      return res.status(200).json(result);
    } catch (err) {
      return next(err);
    }
  };

  setKarnaySurnay = async (req, res, next) => {
    try {
      const karnay = await this.service.setKarnaySurnay(req.user, req.params.hallId, req.body);
      return res.status(200).json({ success: true, data: karnay });
    } catch (err) {
      return next(err);
    }
  };
}

export const servicesController = new ServicesController();
