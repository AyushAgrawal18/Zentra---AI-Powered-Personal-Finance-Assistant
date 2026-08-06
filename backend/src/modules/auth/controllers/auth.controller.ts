import { Request, Response, NextFunction } from 'express';
import { registerService, loginService, refreshTokenService, logoutService, currentUserService } from '../services';
import { RegisterDTO, LoginDTO, RefreshDTO } from '../dto';
import { AuthenticatedRequest } from '../../../common/middleware/auth';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data: RegisterDTO = req.body;
    const result = await registerService(data);

    res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data: LoginDTO = req.body;
    const result = await loginService(data);

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const refresh = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data: RefreshDTO = req.body;
    const result = await refreshTokenService(data);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    await logoutService(req.user.id);

    res.status(200).json({
      success: true,
      message: 'Logged out successfully.',
    });
  } catch (error) {
    next(error);
  }
};

export const me = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const result = await currentUserService(req.user.id);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
