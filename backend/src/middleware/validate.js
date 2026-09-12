import { ValidationError } from '../shared/errors/index.js';

export const validate = (schema) => {
  return (req, _res, next) => {
    try {
      const dataToValidate = {};
      if (schema.body) dataToValidate.body = req.body;
      if (schema.query) dataToValidate.query = req.query;
      if (schema.params) dataToValidate.params = req.params;

      // Support passing either a schema with { body, query, params } or individual schemas
      let validationError = null;

      if (schema.body) {
        const bodyParsed = schema.body.safeParse(req.body);
        if (!bodyParsed.success) {
          validationError = bodyParsed.error;
        } else {
          req.body = bodyParsed.data;
        }
      }

      if (!validationError && schema.query) {
        const queryParsed = schema.query.safeParse(req.query);
        if (!queryParsed.success) {
          validationError = queryParsed.error;
        } else {
          req.query = queryParsed.data;
        }
      }

      if (!validationError && schema.params) {
        const paramsParsed = schema.params.safeParse(req.params);
        if (!paramsParsed.success) {
          validationError = paramsParsed.error;
        } else {
          req.params = paramsParsed.data;
        }
      }

      if (validationError) {
        const issues = validationError.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        }));
        return next(new ValidationError('Validation failed', issues));
      }

      return next();
    } catch (err) {
      return next(err);
    }
  };
};
