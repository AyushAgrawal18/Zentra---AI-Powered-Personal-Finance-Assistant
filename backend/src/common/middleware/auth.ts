import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../../modules/auth/utils';
import { AuthenticationError, AuthorizationError } from '../errors';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role?: string;
  };
}

export const authenticate = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('Authentication required');
    }

    const token = authHeader.split(' ')[1];
    const payload = verifyAccessToken(token);

    req.user = { id: payload.userId };
    
    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      next(new AuthenticationError('Token expired'));
    } else {
      next(new AuthenticationError('Invalid token'));
    }
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AuthorizationError('Not authorized'));
    }

    if (roles.length > 0) {
      const userRole = req.user.role || 'user';
      if (!roles.includes(userRole)) {
        return next(new AuthorizationError('Insufficient permissions'));
      }
    }

    next();
  };
};

export const optionalAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const payload = verifyAccessToken(token);
      req.user = { id: payload.userId };
    }
    next();
  } catch (error) {
    next();
  }
};
