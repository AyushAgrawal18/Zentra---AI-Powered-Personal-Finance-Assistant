import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { ValidationError } from '../errors';

export const validate = (schema: AnyZodObject, statusCode = 400) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        next(new ValidationError('Validation failed', error.errors, statusCode));
      } else {
        next(error);
      }
    }
  };
};

// Compatibility alias used by existing module routes.
export const validateRequest = validate;
