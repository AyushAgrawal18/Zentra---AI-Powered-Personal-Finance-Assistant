export const PAYMENT_STATUSES = {
  PENDING: "pending",
  COMPLETED: "completed",
  FAILED: "failed",
} as const;

export type PaymentStatus =
  (typeof PAYMENT_STATUSES)[keyof typeof PAYMENT_STATUSES];

export const PAYMENT_SORT_FIELDS: Record<string, string> = {
  created_at: "created_at",
  amount: "amount",
  merchant_name: "merchant_name",
  status: "status",
};

export const PAYMENT_DEFAULT_SORT = "created_at";
export const PAYMENT_DEFAULT_ORDER = "DESC";
export const PAYMENT_DEFAULT_PAGE = 1;
export const PAYMENT_DEFAULT_LIMIT = 20;
export const PAYMENT_MAX_LIMIT = 100;

export const PAYMENT_MESSAGES = {
  INITIATED: "Payment intent created successfully.",
  LIST_FETCHED: "Payments fetched successfully.",
  FETCHED: "Payment details fetched successfully.",
  RECONCILED: "Payment reconciled successfully.",
  FAILED: "Payment marked as failed.",
  CANCELLED: "Payment intent cancelled successfully.",
  NOT_FOUND: "Payment not found.",
  ALREADY_RECONCILED: "Payment has already been reconciled.",
  NOT_PENDING: "Only pending payment intents may be cancelled.",
  INVALID_CATEGORY: "Category not found or does not belong to you.",
  CATEGORY_REQUIRED: "Category ID is required for successful reconciliation.",
} as const;
