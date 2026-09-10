export const IMPORT_STATUSES = {
  PENDING: "pending",
  PROCESSING: "processing",
  COMPLETED: "completed",
  FAILED: "failed",
} as const;

export const CSV_DEFAULT_PAGE = 1;
export const CSV_DEFAULT_LIMIT = 20;
export const CSV_MAX_LIMIT = 100;
export const CSV_MAX_FILE_SIZE = 5 * 1024 * 1024;

export const CSV_MESSAGES = {
  UPLOADED: "CSV uploaded successfully.",
  PREVIEW_READY: "CSV preview generated successfully.",
  COMPLETED: "Import completed successfully.",
  LIST_FETCHED: "Import history fetched successfully.",
  DETAILS_FETCHED: "Import details fetched successfully.",
  CANCELLED: "Import cancelled successfully.",
  NOT_FOUND: "Import not found.",
  INVALID_FILE: "A non-empty UTF-8 CSV file is required.",
  INVALID_STATUS: "This import cannot be modified in its current state.",
} as const;

export type ImportStatus =
  (typeof IMPORT_STATUSES)[keyof typeof IMPORT_STATUSES];
