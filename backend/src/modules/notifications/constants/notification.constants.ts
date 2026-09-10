export const NOTIFICATION_TYPES = {
  SYSTEM: "system",
  SECURITY: "security",
  GOAL: "goal",
  BUDGET: "budget",
  TRANSACTION: "transaction",
  AI: "ai",
} as const;

export const NOTIFICATION_PRIORITIES = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
} as const;

export const NOTIFICATION_SORT_FIELDS: Record<string, string> = {
  created_at: "created_at",
  priority: "priority",
};

export const NOTIFICATION_DEFAULT_PAGE = 1;
export const NOTIFICATION_DEFAULT_LIMIT = 20;
export const NOTIFICATION_MAX_LIMIT = 100;

export const NOTIFICATION_MESSAGES = {
  LIST_FETCHED: "Notifications fetched successfully.",
  FETCHED: "Notification fetched successfully.",
  MARKED_READ: "Notification marked as read.",
  ALL_MARKED_READ: "All notifications marked as read.",
  UNREAD_COUNT: "Unread notification count fetched successfully.",
  DELETED: "Notification deleted successfully.",
  PREFERENCES_FETCHED: "Notification preferences fetched successfully.",
  PREFERENCES_UPDATED: "Notification preferences updated successfully.",
  NOT_FOUND: "Notification not found.",
} as const;
