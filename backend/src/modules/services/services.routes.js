import { Router } from 'express';
import { servicesController } from './services.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import { validate } from '../../middleware/validate.js';
import { upload } from '../../middleware/upload.js';
import { ROLES } from '../../shared/constants/roles.js';
import {
  createSingerSchema,
  updateSingerSchema,
  createCarSchema,
  updateCarSchema,
  createMenuSchema,
  updateMenuSchema,
  setKarnaySurnaySchema,
} from './services.validation.js';

const router = Router({ mergeParams: true });

router.use(authenticate, authorize(ROLES.ADMIN, ROLES.OWNER));

// Singers
router.post(
  '/singers',
  upload.single('image'),
  validate(createSingerSchema),
  servicesController.addSinger
);
router.patch(
  '/singers/:singerId',
  upload.single('image'),
  validate(updateSingerSchema),
  servicesController.updateSinger
);
router.delete('/singers/:singerId', servicesController.deleteSinger);

// Cars
router.post('/cars', upload.single('image'), validate(createCarSchema), servicesController.addCar);
router.patch(
  '/cars/:carId',
  upload.single('image'),
  validate(updateCarSchema),
  servicesController.updateCar
);
router.delete('/cars/:carId', servicesController.deleteCar);

// Menu Options
router.post('/menu', validate(createMenuSchema), servicesController.addMenuOption);
router.patch('/menu/:menuId', validate(updateMenuSchema), servicesController.updateMenuOption);
router.delete('/menu/:menuId', servicesController.deleteMenuOption);

// Karnay-Surnay
router.put('/karnay-surnay', validate(setKarnaySurnaySchema), servicesController.setKarnaySurnay);

export default router;
