export const REPORT_TYPES = {
  MONTHLY_SUMMARY: "MONTHLY_SUMMARY",
  YEARLY_SUMMARY: "YEARLY_SUMMARY",
  CATEGORY_SPENDING: "CATEGORY_SPENDING",
  BUDGET_REPORT: "BUDGET_REPORT",
  GOAL_REPORT: "GOAL_REPORT",
  INCOME_VS_EXPENSE: "INCOME_VS_EXPENSE",
  CASH_FLOW: "CASH_FLOW",
  TRANSACTION_REPORT: "TRANSACTION_REPORT",
} as const;

export const REPORT_FORMATS = { CSV: "CSV", PDF: "PDF" } as const;
export const REPORT_DEFAULT_PAGE = 1;
export const REPORT_DEFAULT_LIMIT = 20;
export const REPORT_MAX_LIMIT = 100;

export const REPORT_MESSAGES = {
  GENERATED: "Report generated successfully.",
  LIST_FETCHED: "Reports fetched successfully.",
  FETCHED: "Report details fetched successfully.",
  DELETED: "Report deleted successfully.",
  NOT_FOUND: "Report not found.",
  INVALID_TYPE: "Report type is not supported.",
} as const;
