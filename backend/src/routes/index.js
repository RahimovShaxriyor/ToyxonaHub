import { Router } from 'express';
import authRouter from '../modules/auth/auth.routes.js';
import usersRouter from '../modules/users/users.routes.js';
import ownersRouter from '../modules/owners/owners.routes.js';
import weddingHallsRouter from '../modules/wedding-halls/wedding-halls.routes.js';
import bookingsRouter from '../modules/bookings/bookings.routes.js';

const router = Router();

router.use('/auth', authRouter);
router.use('/users', usersRouter);
router.use('/owners', ownersRouter);
router.use('/wedding-halls', weddingHallsRouter);
router.use('/bookings', bookingsRouter);

export default router;
