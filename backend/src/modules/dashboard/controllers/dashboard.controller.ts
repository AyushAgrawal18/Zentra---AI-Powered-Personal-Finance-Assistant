import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../../common/middleware/auth';
import { getDashboardService } from '../services';
import { DashboardQueryDTO } from '../dto';
import { DASHBOARD_MESSAGES } from '../constants';

export const getDashboard = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const query = {
      month: req.query.month ? Number(req.query.month) : undefined,
      year: req.query.year ? Number(req.query.year) : undefined,
    } as DashboardQueryDTO;

    const result = await getDashboardService(req.user!.id, query);
    
    res.status(200).json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

export const refreshDashboard = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    // In v1, refresh acts the same as getDashboard. No caching is implemented yet.
    const query = {
      month: req.query.month ? Number(req.query.month) : undefined,
      year: req.query.year ? Number(req.query.year) : undefined,
    } as DashboardQueryDTO;

    const result = await getDashboardService(req.user!.id, query);
    
    res.status(200).json({
      success: true,
      message: DASHBOARD_MESSAGES.REFRESHED,
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};
