import { AppError } from '../shared/errors/index.js';
import { env } from '../config/env.js';

export const errorHandler = (err, _req, res, _next) => {
  // Operational errors created by application
  if (err instanceof AppError) {
    const response = {
      success: false,
      error: {
        code: err.code,
        message: err.message,
      },
    };

    if (err.details) {
      response.error.details = err.details;
    }

    return res.status(err.statusCode).json(response);
  }

  // Handle Prisma Known Request Errors
  if (err.code === 'P2002') {
    const target = err.meta?.target || [];
    const isBookingConflict =
      (Array.isArray(target) && target.includes('bookingDate')) ||
      (typeof err.message === 'string' &&
        (err.message.includes('unique_active_booking_per_hall_date') ||
          err.message.includes('bookingDate')));

    if (isBookingConflict) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'BOOKING_DATE_UNAVAILABLE',
          message: 'Wedding hall is already booked for this date',
        },
      });
    }

    return res.status(409).json({
      success: false,
      error: {
        code: 'DUPLICATE_ENTRY',
        message: 'A record with this field already exists',
        details: target,
      },
    });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Requested database record was not found',
      },
    });
  }

  // Handle Multer upload errors
  if (err.name === 'MulterError') {
    return res.status(400).json({
      success: false,
      error: {
        code: 'UPLOAD_ERROR',
        message: err.message,
      },
    });
  }

  // Handle invalid JSON body syntax
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_JSON',
        message: 'Malformed JSON payload in request body',
      },
    });
  }

  // Unexpected internal server errors
  if (env.NODE_ENV !== 'test') {
    console.error('Unhandled Server Error:', err);
  }

  return res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected internal server error occurred',
    },
  });
};
