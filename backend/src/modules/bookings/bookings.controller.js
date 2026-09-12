import { bookingsService } from './bookings.service.js';

export class BookingsController {
  constructor(service = bookingsService) {
    this.service = service;
  }

  createBooking = async (req, res, next) => {
    try {
      const booking = await this.service.createBooking(req.user, req.body);
      return res.status(201).json({
        success: true,
        data: booking,
      });
    } catch (err) {
      return next(err);
    }
  };

  getMyBookings = async (req, res, next) => {
    try {
      const result = await this.service.listUserBookings(req.user.id, req.query);
      return res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (err) {
      return next(err);
    }
  };

  getOwnerBookings = async (req, res, next) => {
    try {
      const result = await this.service.listOwnerBookings(req.user.id, req.query);
      return res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (err) {
      return next(err);
    }
  };

  getAdminBookings = async (req, res, next) => {
    try {
      const result = await this.service.listAdminBookings(req.query);
      return res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (err) {
      return next(err);
    }
  };

  getBookingById = async (req, res, next) => {
    try {
      const booking = await this.service.getBookingById(req.user, req.params.id);
      return res.status(200).json({
        success: true,
        data: booking,
      });
    } catch (err) {
      return next(err);
    }
  };

  cancelBooking = async (req, res, next) => {
    try {
      const result = await this.service.cancelBooking(req.user, req.params.id);
      return res.status(200).json({
        success: true,
        message: 'Booking successfully cancelled',
        data: result,
      });
    } catch (err) {
      return next(err);
    }
  };

  payBooking = async (req, res, next) => {
    try {
      const result = await this.service.mockPayment(req.user, req.params.id);
      return res.status(200).json(result);
    } catch (err) {
      return next(err);
    }
  };
}

export const bookingsController = new BookingsController();
