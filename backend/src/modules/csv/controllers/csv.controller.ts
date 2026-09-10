import { NextFunction, Response } from "express";
import { AuthenticatedRequest } from "../../../common/middleware/auth";
import { ValidationError } from "../../../common/errors";
import { CSV_MESSAGES } from "../constants";
import {
  cancelCsvService,
  confirmCsvService,
  getCsvService,
  listCsvService,
  previewCsvService,
  uploadCsvService,
} from "../services";

export const uploadCsv = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.file || req.file.mimetype !== "text/csv")
      throw new ValidationError(CSV_MESSAGES.INVALID_FILE);
    const result = await uploadCsvService(
      req.user!.id,
      req.file.originalname,
      req.file.buffer,
    );
    res
      .status(201)
      .json({
        success: true,
        message: CSV_MESSAGES.UPLOADED,
        data: { importId: result.id, status: "UPLOADED" },
      });
  } catch (error) {
    next(error);
  }
};

export const previewCsv = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await previewCsvService(req.params.id, req.user!.id);
    res
      .status(200)
      .json({
        success: true,
        message: CSV_MESSAGES.PREVIEW_READY,
        data: result,
      });
  } catch (error) {
    next(error);
  }
};

export const confirmCsv = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await confirmCsvService(req.params.id, req.user!.id);
    res
      .status(200)
      .json({ success: true, message: CSV_MESSAGES.COMPLETED, data: result });
  } catch (error) {
    next(error);
  }
};

export const listCsv = async (
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
    const result = await listCsvService(req.user!.id, query);
    res
      .status(200)
      .json({
        success: true,
        message: CSV_MESSAGES.LIST_FETCHED,
        data: result.data,
        meta: result.meta,
      });
  } catch (error) {
    next(error);
  }
};

export const getCsv = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await getCsvService(req.params.id, req.user!.id);
    res
      .status(200)
      .json({
        success: true,
        message: CSV_MESSAGES.DETAILS_FETCHED,
        data: result,
      });
  } catch (error) {
    next(error);
  }
};

export const cancelCsv = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    await cancelCsvService(req.params.id, req.user!.id);
    res.status(200).json({ success: true, message: CSV_MESSAGES.CANCELLED });
  } catch (error) {
    next(error);
  }
};
