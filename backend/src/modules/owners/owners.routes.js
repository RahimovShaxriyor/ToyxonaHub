import { Router } from 'express';
import { ownersController } from './owners.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import { validate } from '../../middleware/validate.js';
import { ROLES } from '../../shared/constants/roles.js';
import { createOwnerSchema, listOwnersSchema } from './owners.validation.js';

const router = Router();

// Only ADMIN can access owners endpoints
router.use(authenticate, authorize(ROLES.ADMIN));

router.post('/', validate(createOwnerSchema), ownersController.createOwner);
router.get('/', validate(listOwnersSchema), ownersController.listOwners);
router.get('/:id', ownersController.getOwnerById);

export default router;
