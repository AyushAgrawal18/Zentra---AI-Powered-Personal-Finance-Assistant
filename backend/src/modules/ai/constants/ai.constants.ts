export const INSIGHT_CATEGORIES = {
  SPENDING_SUMMARY: "SPENDING_SUMMARY",
  BUDGET_ALERT: "BUDGET_ALERT",
  SAVINGS_RECOMMENDATION: "SAVINGS_RECOMMENDATION",
  CATEGORY_TREND: "CATEGORY_TREND",
  GOAL_PROGRESS: "GOAL_PROGRESS",
  CASH_FLOW: "CASH_FLOW",
  MONTHLY_REPORT: "MONTHLY_REPORT",
} as const;

export const INSIGHT_PRIORITIES = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
} as const;
export const INSIGHT_DEFAULT_PAGE = 1;
export const INSIGHT_DEFAULT_LIMIT = 20;
export const INSIGHT_MAX_LIMIT = 100;

export const INSIGHT_MESSAGES = {
  LIST_FETCHED: "Insights fetched successfully.",
  FETCHED: "Insight fetched successfully.",
  REFRESHED: "Insights generated successfully.",
  HISTORY_FETCHED: "Insight history fetched successfully.",
  NOT_FOUND: "Insight not found.",
} as const;

export const INSIGHT_DB_TYPES: Record<string, string> = {
  SPENDING_SUMMARY: "spending_analysis",
  CATEGORY_TREND: "spending_analysis",
  CASH_FLOW: "spending_analysis",
  BUDGET_ALERT: "budget_warning",
  GOAL_PROGRESS: "goal_prediction",
  SAVINGS_RECOMMENDATION: "general",
  MONTHLY_REPORT: "general",
};
