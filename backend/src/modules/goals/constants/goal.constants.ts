export const GOAL_STATUSES = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

export type GoalStatusDB = typeof GOAL_STATUSES[keyof typeof GOAL_STATUSES];

// Human-readable form returned in API responses (uppercase)
export const GOAL_STATUS_DISPLAY = {
  active: 'ACTIVE',
  completed: 'COMPLETED',
  cancelled: 'CANCELLED',
} as const;

export const GOAL_SORT_FIELDS: Record<string, string> = {
  created_at: 'created_at',
  name: 'name',
  target_amount: 'target_amount',
  target_date: 'target_date',
  current_amount: 'current_amount',
};

export const GOAL_DEFAULT_SORT = 'created_at';
export const GOAL_DEFAULT_ORDER = 'DESC';
export const GOAL_DEFAULT_PAGE = 1;
export const GOAL_DEFAULT_LIMIT = 20;
export const GOAL_MAX_LIMIT = 100;

export const GOAL_MESSAGES = {
  CREATED: 'Goal created successfully.',
  UPDATED: 'Goal updated successfully.',
  DELETED: 'Goal deleted successfully.',
  FETCHED: 'Goal fetched successfully.',
  LIST_FETCHED: 'Goals fetched successfully.',
  PROGRESS_FETCHED: 'Goal progress fetched successfully.',
  CONTRIBUTION_ADDED: 'Contribution added successfully.',
  NOT_FOUND: 'Goal not found.',
  FORBIDDEN: 'You do not have access to this goal.',
  CONFLICT: 'A goal with this name already exists.',
  ALREADY_COMPLETED: 'This goal is already completed.',
  ALREADY_CANCELLED: 'Cancelled goals cannot be modified.',
  CONTRIBUTION_EXCEEDS: 'Contribution amount exceeds remaining target.',
  INVALID_CONTRIBUTION: 'Contribution amount must be greater than zero.',
  CANCELLED_NO_CONTRIB: 'Cancelled goals cannot receive contributions.',
};
