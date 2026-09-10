import { NextFunction, Response } from "express";
import { AuthenticatedRequest } from "../../../common/middleware/auth";
import { NOTIFICATION_MESSAGES } from "../constants";
import {
  deleteNotificationService,
  getNotificationPreferencesService,
  getNotificationService,
  getUnreadCountService,
  listNotificationsService,
  markAllNotificationsReadService,
  markNotificationReadService,
  updateNotificationPreferencesService,
} from "../services";

export const listNotifications = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const query = {
      ...req.query,
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
    } as any;
    const result = await listNotificationsService(req.user!.id, query);
    res
      .status(200)
      .json({
        success: true,
        message: NOTIFICATION_MESSAGES.LIST_FETCHED,
        data: result.data,
        meta: result.meta,
      });
  } catch (error) {
    next(error);
  }
};

export const getNotification = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await getNotificationService(req.params.id, req.user!.id);
    res
      .status(200)
      .json({
        success: true,
        message: NOTIFICATION_MESSAGES.FETCHED,
        data: result,
      });
  } catch (error) {
    next(error);
  }
};

export const markNotificationRead = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    await markNotificationReadService(req.params.id, req.user!.id);
    res
      .status(200)
      .json({ success: true, message: NOTIFICATION_MESSAGES.MARKED_READ });
  } catch (error) {
    next(error);
  }
};

export const markAllNotificationsRead = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    await markAllNotificationsReadService(req.user!.id);
    res
      .status(200)
      .json({ success: true, message: NOTIFICATION_MESSAGES.ALL_MARKED_READ });
  } catch (error) {
    next(error);
  }
};

export const getUnreadCount = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await getUnreadCountService(req.user!.id);
    res
      .status(200)
      .json({
        success: true,
        message: NOTIFICATION_MESSAGES.UNREAD_COUNT,
        data: result,
      });
  } catch (error) {
    next(error);
  }
};

export const deleteNotification = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    await deleteNotificationService(req.params.id, req.user!.id);
    res
      .status(200)
      .json({ success: true, message: NOTIFICATION_MESSAGES.DELETED });
  } catch (error) {
    next(error);
  }
};

export const getNotificationPreferences = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await getNotificationPreferencesService(req.user!.id);
    res
      .status(200)
      .json({
        success: true,
        message: NOTIFICATION_MESSAGES.PREFERENCES_FETCHED,
        data: result,
      });
  } catch (error) {
    next(error);
  }
};

export const updateNotificationPreferences = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await updateNotificationPreferencesService(
      req.user!.id,
      req.body,
    );
    res
      .status(200)
      .json({
        success: true,
        message: NOTIFICATION_MESSAGES.PREFERENCES_UPDATED,
        data: result,
      });
  } catch (error) {
    next(error);
  }
};
