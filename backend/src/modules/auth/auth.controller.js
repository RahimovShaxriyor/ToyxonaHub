import { authService } from './auth.service.js';

export class AuthController {
  constructor(service = authService) {
    this.service = service;
  }

  register = async (req, res, next) => {
    try {
      const result = await this.service.register(req.body);
      return res.status(201).json({
        success: true,
        data: result,
      });
    } catch (err) {
      return next(err);
    }
  };

  login = async (req, res, next) => {
    try {
      const result = await this.service.login(req.body);
      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      return next(err);
    }
  };

  refreshToken = async (req, res, next) => {
    try {
      const result = await this.service.refreshToken(req.body.refreshToken);
      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      return next(err);
    }
  };

  logout = async (req, res, next) => {
    try {
      const result = await this.service.logout(req.body.refreshToken);
      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      return next(err);
    }
  };

  sendOtp = async (req, res, next) => {
    try {
      const result = await this.service.sendOtp(req.body.email);
      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      return next(err);
    }
  };

  verifyOtp = async (req, res, next) => {
    try {
      const result = await this.service.verifyOtp(req.body);
      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      return next(err);
    }
  };
}

export const authController = new AuthController();
