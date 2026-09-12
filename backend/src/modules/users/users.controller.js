import { usersService } from './users.service.js';

export class UsersController {
  constructor(service = usersService) {
    this.service = service;
  }

  getMe = async (req, res, next) => {
    try {
      const user = await this.service.getProfile(req.user.id);
      return res.status(200).json({
        success: true,
        data: user,
      });
    } catch (err) {
      return next(err);
    }
  };

  updateMe = async (req, res, next) => {
    try {
      const updatedUser = await this.service.updateProfile(req.user.id, req.body);
      return res.status(200).json({
        success: true,
        data: updatedUser,
      });
    } catch (err) {
      return next(err);
    }
  };
}

export const usersController = new UsersController();
