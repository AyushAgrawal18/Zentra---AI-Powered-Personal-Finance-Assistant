export const BUDGET_PERIODS = {
  MONTHLY: 'monthly',
  WEEKLY: 'weekly',
  YEARLY: 'yearly',
} as const;

export type BudgetPeriod = typeof BUDGET_PERIODS[keyof typeof BUDGET_PERIODS];

export const BUDGET_STATUSES = {
  ON_TRACK: 'ON_TRACK',
  NEAR_LIMIT: 'NEAR_LIMIT',
  EXCEEDED: 'EXCEEDED',
} as const;

export type BudgetStatus = typeof BUDGET_STATUSES[keyof typeof BUDGET_STATUSES];

export const BUDGET_SORT_FIELDS: Record<string, string> = {
  created_at: 'created_at',
  name: 'name',
  amount: 'amount',
  month: 'month',
  year: 'year',
};

export const BUDGET_DEFAULT_SORT = 'created_at';
export const BUDGET_DEFAULT_ORDER = 'DESC';
export const BUDGET_DEFAULT_PAGE = 1;
export const BUDGET_DEFAULT_LIMIT = 20;
export const BUDGET_MAX_LIMIT = 100;

export const BUDGET_MESSAGES = {
  CREATED: 'Budget created successfully.',
  UPDATED: 'Budget updated successfully.',
  DELETED: 'Budget deleted successfully.',
  FETCHED: 'Budget details fetched successfully.',
  LIST_FETCHED: 'Budgets fetched successfully.',
  PROGRESS_FETCHED: 'Budget progress fetched successfully.',
  SUMMARY_FETCHED: 'Budget summary fetched successfully.',
  NOT_FOUND: 'Budget not found.',
  FORBIDDEN: 'You do not have access to this budget.',
  CONFLICT: 'A budget for this category and period already exists.',
  INVALID_CATEGORY: 'Category does not exist or access is denied.',
  INVALID_CATEGORY_TYPE: 'Only expense categories are eligible for expense budgets.',
  MANUAL_SPENT_UPDATE_FORBIDDEN: 'Manual updates to spent_amount are not allowed.',
};
