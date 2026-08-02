import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors';
import { logger } from '../logger';
import { env } from '../../config/env';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = 500;
  let message = 'Internal server error';
  let errorCode = 'INTERNAL_ERROR';
  let details = undefined;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    errorCode = err.code;
    if ('details' in err) {
      details = (err as any).details;
    }
  }

  // Log error
  if (statusCode >= 500) {
    logger.error({ err, req: { method: req.method, url: req.url } }, err.message);
  } else {
    logger.warn({ err, req: { method: req.method, url: req.url } }, err.message);
  }

  const response: any = {
    success: false,
    message,
    error: {
      code: errorCode,
      details,
    },
  };

  if (env.NODE_ENV === 'development' && statusCode >= 500) {
    response.error.stack = err.stack;
  }

  res.status(statusCode).json(response);
};
