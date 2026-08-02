import { Request, Response, NextFunction } from 'express';

// Placeholder auth middleware as requested
export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  // Authentication logic will be implemented later
  next();
};

export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Authorization logic will be implemented later
    next();
  };
};
