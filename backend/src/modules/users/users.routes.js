import { Router } from 'express';
import { usersController } from './users.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { validate } from '../../middleware/validate.js';
import { updateProfileSchema } from './users.validation.js';

const router = Router();

router.use(authenticate);

router.get('/me', usersController.getMe);
router.patch('/me', validate(updateProfileSchema), usersController.updateMe);

export default router;
