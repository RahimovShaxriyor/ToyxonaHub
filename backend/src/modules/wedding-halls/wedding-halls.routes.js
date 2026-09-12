import { Router } from 'express';
import { weddingHallsController } from './wedding-halls.controller.js';
import { authenticate, optionalAuthenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import { validate } from '../../middleware/validate.js';
import { upload } from '../../middleware/upload.js';
import { ROLES } from '../../shared/constants/roles.js';
import {
  createHallSchema,
  updateHallSchema,
  updateStatusSchema,
  assignOwnerSchema,
  listHallsQuerySchema,
  availabilityQuerySchema,
} from './wedding-halls.validation.js';
import servicesRouter from '../services/services.routes.js';

const router = Router();

// Public / Authenticated read routes
router.get(
  '/',
  optionalAuthenticate,
  validate(listHallsQuerySchema),
  weddingHallsController.listHalls
);
router.get('/:id', optionalAuthenticate, weddingHallsController.getHallById);
router.get(
  '/:id/availability',
  optionalAuthenticate,
  validate(availabilityQuerySchema),
  weddingHallsController.getAvailability
);

// Nested Additional Services routes
router.use('/:hallId/services', servicesRouter);

// Protected Write routes
router.post(
  '/',
  authenticate,
  authorize(ROLES.ADMIN, ROLES.OWNER),
  upload.array('images', 10),
  validate(createHallSchema),
  weddingHallsController.createHall
);

router.patch(
  '/:id',
  authenticate,
  authorize(ROLES.ADMIN, ROLES.OWNER),
  validate(updateHallSchema),
  weddingHallsController.updateHall
);

// Admin-only management routes
router.patch(
  '/:id/status',
  authenticate,
  authorize(ROLES.ADMIN),
  validate(updateStatusSchema),
  weddingHallsController.updateStatus
);

router.patch(
  '/:id/assign-owner',
  authenticate,
  authorize(ROLES.ADMIN),
  validate(assignOwnerSchema),
  weddingHallsController.assignOwner
);

router.delete('/:id', authenticate, authorize(ROLES.ADMIN), weddingHallsController.deleteHall);

// Image management routes
router.post(
  '/:id/images',
  authenticate,
  authorize(ROLES.ADMIN, ROLES.OWNER),
  upload.array('images', 10),
  weddingHallsController.uploadImages
);

router.delete(
  '/:id/images/:imageId',
  authenticate,
  authorize(ROLES.ADMIN, ROLES.OWNER),
  weddingHallsController.deleteImage
);

router.patch(
  '/:id/images/:imageId/primary',
  authenticate,
  authorize(ROLES.ADMIN, ROLES.OWNER),
  weddingHallsController.setPrimaryImage
);

export default router;
