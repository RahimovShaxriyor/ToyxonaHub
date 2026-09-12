import { Router } from 'express';
import { bookingsController } from './bookings.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import { validate } from '../../middleware/validate.js';
import { ROLES } from '../../shared/constants/roles.js';
import { createBookingSchema, listBookingsQuerySchema } from './bookings.validation.js';

const router = Router();

router.use(authenticate);

// 1. Create booking (USER role only)
router.post(
  '/',
  authorize(ROLES.USER),
  validate(createBookingSchema),
  bookingsController.createBooking
);

// 2. User's own bookings
router.get(
  '/my',
  authorize(ROLES.USER),
  validate(listBookingsQuerySchema),
  bookingsController.getMyBookings
);

// 3. Owner's hall bookings
router.get(
  '/owner',
  authorize(ROLES.OWNER),
  validate(listBookingsQuerySchema),
  bookingsController.getOwnerBookings
);

// 4. Admin all bookings
router.get(
  '/admin',
  authorize(ROLES.ADMIN),
  validate(listBookingsQuerySchema),
  bookingsController.getAdminBookings
);

// 5. Booking details
router.get('/:id', bookingsController.getBookingById);

// 6. Cancel booking (USER, OWNER, or ADMIN with permission check)
router.patch('/:id/cancel', bookingsController.cancelBooking);

// 7. Mock payment endpoint
router.post('/:id/pay', bookingsController.payBooking);

export default router;
