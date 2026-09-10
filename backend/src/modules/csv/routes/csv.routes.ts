import { NextFunction, Request, Response, Router } from "express";
import multer from "multer";
import { AppError } from "../../../common/errors";
import { authenticate } from "../../../common/middleware/auth";
import { validate } from "../../../common/middleware/validate";
import { CSV_MAX_FILE_SIZE } from "../constants";
import {
  cancelCsv,
  confirmCsv,
  getCsv,
  listCsv,
  previewCsv,
  uploadCsv,
} from "../controllers";
import { importIdParamSchema, listImportsSchema } from "../validators";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: CSV_MAX_FILE_SIZE, files: 1 },
  fileFilter: (_req, file, callback) =>
    callback(null, file.mimetype === "text/csv"),
});

const uploadErrorHandler = (
  error: any,
  _req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
    next(
      new AppError(
        "CSV file exceeds the maximum allowed size.",
        413,
        "FILE_TOO_LARGE",
      ),
    );
    return;
  }
  next(error);
};

const router = Router();
router.post(
  "/upload",
  authenticate,
  upload.single("file"),
  uploadErrorHandler,
  uploadCsv,
);
router.get("/", authenticate, validate(listImportsSchema), listCsv);
router.get(
  "/:id/preview",
  authenticate,
  validate(importIdParamSchema),
  previewCsv,
);
router.post(
  "/:id/confirm",
  authenticate,
  validate(importIdParamSchema),
  confirmCsv,
);
router.get("/:id", authenticate, validate(importIdParamSchema), getCsv);
router.delete("/:id", authenticate, validate(importIdParamSchema), cancelCsv);

export default router;
