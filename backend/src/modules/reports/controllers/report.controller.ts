import { NextFunction, Response } from "express";
import { AuthenticatedRequest } from "../../../common/middleware/auth";
import { REPORT_MESSAGES } from "../constants";
import {
  deleteReportService,
  downloadReportService,
  generateReportService,
  getReportService,
  listReportsService,
} from "../services";

export const generateReport = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    res
      .status(202)
      .json({
        success: true,
        message: REPORT_MESSAGES.GENERATED,
        data: await generateReportService(req.user!.id, req.body),
      });
  } catch (error) {
    next(error);
  }
};
export const listReports = async (
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
    const result = await listReportsService(req.user!.id, query);
    res
      .status(200)
      .json({
        success: true,
        message: REPORT_MESSAGES.LIST_FETCHED,
        data: result.data,
        meta: result.meta,
      });
  } catch (error) {
    next(error);
  }
};
export const getReport = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    res
      .status(200)
      .json({
        success: true,
        message: REPORT_MESSAGES.FETCHED,
        data: await getReportService(req.params.id, req.user!.id),
      });
  } catch (error) {
    next(error);
  }
};
export const downloadReport = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await downloadReportService(req.params.id, req.user!.id);
    res
      .type(result.format === "PDF" ? "application/pdf" : "text/csv")
      .attachment(result.filename)
      .send(result.content);
  } catch (error) {
    next(error);
  }
};
export const deleteReport = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    await deleteReportService(req.params.id, req.user!.id);
    res.status(200).json({ success: true, message: REPORT_MESSAGES.DELETED });
  } catch (error) {
    next(error);
  }
};
