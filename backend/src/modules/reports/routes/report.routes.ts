import { Router } from "express";
import { authenticate } from "../../../common/middleware/auth";
import { validate } from "../../../common/middleware/validate";
import {
  createReportSchema,
  listReportsSchema,
  reportIdParamSchema,
} from "../validators";
import {
  deleteReport,
  downloadReport,
  generateReport,
  getReport,
  listReports,
} from "../controllers";

const router = Router();
router.post("/", authenticate, validate(createReportSchema), generateReport);
router.get("/", authenticate, validate(listReportsSchema), listReports);
router.get(
  "/:id/download",
  authenticate,
  validate(reportIdParamSchema),
  downloadReport,
);
router.get("/:id", authenticate, validate(reportIdParamSchema), getReport);
router.delete(
  "/:id",
  authenticate,
  validate(reportIdParamSchema),
  deleteReport,
);
export default router;
