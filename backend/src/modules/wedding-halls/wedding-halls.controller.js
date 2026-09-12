import { weddingHallsService } from './wedding-halls.service.js';

export class WeddingHallsController {
  constructor(service = weddingHallsService) {
    this.service = service;
  }

  createHall = async (req, res, next) => {
    try {
      const files = req.files || [];
      const hall = await this.service.createHall(req.user, req.body, files);
      return res.status(201).json({
        success: true,
        data: hall,
      });
    } catch (err) {
      return next(err);
    }
  };

  listHalls = async (req, res, next) => {
    try {
      const result = await this.service.listHalls(req.user, req.query);
      return res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (err) {
      return next(err);
    }
  };

  getHallById = async (req, res, next) => {
    try {
      const hall = await this.service.getHallById(req.user, req.params.id);
      return res.status(200).json({
        success: true,
        data: hall,
      });
    } catch (err) {
      return next(err);
    }
  };

  updateHall = async (req, res, next) => {
    try {
      const updated = await this.service.updateHall(req.user, req.params.id, req.body);
      return res.status(200).json({
        success: true,
        data: updated,
      });
    } catch (err) {
      return next(err);
    }
  };

  updateStatus = async (req, res, next) => {
    try {
      const updated = await this.service.updateStatus(req.params.id, req.body.status);
      return res.status(200).json({
        success: true,
        data: updated,
      });
    } catch (err) {
      return next(err);
    }
  };

  assignOwner = async (req, res, next) => {
    try {
      const updated = await this.service.assignOwner(req.params.id, req.body.ownerId);
      return res.status(200).json({
        success: true,
        data: updated,
      });
    } catch (err) {
      return next(err);
    }
  };

  deleteHall = async (req, res, next) => {
    try {
      const result = await this.service.deleteHall(req.params.id);
      return res.status(200).json(result);
    } catch (err) {
      return next(err);
    }
  };

  getAvailability = async (req, res, next) => {
    try {
      const calendar = await this.service.getAvailability(req.user, req.params.id, req.query);
      return res.status(200).json({
        success: true,
        data: calendar,
      });
    } catch (err) {
      return next(err);
    }
  };

  uploadImages = async (req, res, next) => {
    try {
      const files = req.files || (req.file ? [req.file] : []);
      const hall = await this.service.uploadImages(req.user, req.params.id, files);
      return res.status(201).json({
        success: true,
        data: hall,
      });
    } catch (err) {
      return next(err);
    }
  };

  deleteImage = async (req, res, next) => {
    try {
      const result = await this.service.deleteImage(req.user, req.params.id, req.params.imageId);
      return res.status(200).json(result);
    } catch (err) {
      return next(err);
    }
  };

  setPrimaryImage = async (req, res, next) => {
    try {
      const result = await this.service.setPrimaryImage(
        req.user,
        req.params.id,
        req.params.imageId
      );
      return res.status(200).json(result);
    } catch (err) {
      return next(err);
    }
  };
}

export const weddingHallsController = new WeddingHallsController();
