import { ownersService } from './owners.service.js';

export class OwnersController {
  constructor(service = ownersService) {
    this.service = service;
  }

  createOwner = async (req, res, next) => {
    try {
      const owner = await this.service.createOwner(req.body);
      return res.status(201).json({
        success: true,
        data: owner,
      });
    } catch (err) {
      return next(err);
    }
  };

  listOwners = async (req, res, next) => {
    try {
      const result = await this.service.listOwners(req.query);
      return res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (err) {
      return next(err);
    }
  };

  getOwnerById = async (req, res, next) => {
    try {
      const owner = await this.service.getOwnerById(req.params.id);
      return res.status(200).json({
        success: true,
        data: owner,
      });
    } catch (err) {
      return next(err);
    }
  };
}

export const ownersController = new OwnersController();
