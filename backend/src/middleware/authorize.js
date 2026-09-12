import { ForbiddenError, UnauthorizedError } from '../shared/errors/index.js';

export const authorize = (...allowedRoles) => {
  return (req, _res, next) => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new ForbiddenError('You do not have permission to perform this action'));
    }

    return next();
  };
};
