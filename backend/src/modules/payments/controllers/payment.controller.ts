import { NextFunction, Response } from "express";
import { AuthenticatedRequest } from "../../../common/middleware/auth";
import {
  cancelPaymentService,
  getPaymentService,
  initiatePaymentService,
  listPaymentsService,
  reconcilePaymentService,
} from "../services";
import { PAYMENT_MESSAGES } from "../constants";

export const initiatePayment = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await initiatePaymentService(
      req.user!.id,
      req.body,
      req.header("Idempotency-Key"),
    );
    res
      .status(201)
      .json({
        success: true,
        message: PAYMENT_MESSAGES.INITIATED,
        data: result,
      });
  } catch (error) {
    next(error);
  }
};

export const listPayments = async (
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
    const result = await listPaymentsService(req.user!.id, query);
    res
      .status(200)
      .json({
        success: true,
        message: PAYMENT_MESSAGES.LIST_FETCHED,
        data: result.data,
        meta: result.meta,
      });
  } catch (error) {
    next(error);
  }
};

export const getPayment = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await getPaymentService(req.params.id, req.user!.id);
    res
      .status(200)
      .json({ success: true, message: PAYMENT_MESSAGES.FETCHED, data: result });
  } catch (error) {
    next(error);
  }
};

export const reconcilePayment = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await reconcilePaymentService(
      req.params.id,
      req.user!.id,
      req.body,
    );
    res
      .status(200)
      .json({
        success: true,
        message: PAYMENT_MESSAGES.RECONCILED,
        data: result,
      });
  } catch (error) {
    next(error);
  }
};

export const cancelPayment = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    await cancelPaymentService(req.params.id, req.user!.id);
    res
      .status(200)
      .json({ success: true, message: PAYMENT_MESSAGES.CANCELLED });
  } catch (error) {
    next(error);
  }
};
