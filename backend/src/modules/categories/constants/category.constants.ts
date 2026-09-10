export const CATEGORY_TYPES = {
  INCOME: 'income',
  EXPENSE: 'expense',
} as const;

export type CategoryType = typeof CATEGORY_TYPES[keyof typeof CATEGORY_TYPES];

export const CATEGORY_SORT_FIELDS: Record<string, string> = {
  name: 'name',
  created_at: 'created_at',
  usage_count: 'usage_count',
};

export const CATEGORY_DEFAULT_SORT = 'name';
export const CATEGORY_DEFAULT_ORDER = 'ASC';
export const CATEGORY_DEFAULT_PAGE = 1;
export const CATEGORY_DEFAULT_LIMIT = 50;
export const CATEGORY_MAX_LIMIT = 100;

export const CATEGORY_MESSAGES = {
  CREATED: 'Category created successfully.',
  UPDATED: 'Category updated successfully.',
  DELETED: 'Category deleted successfully.',
  FETCHED: 'Category fetched successfully.',
  LIST_FETCHED: 'Categories fetched successfully.',
  NOT_FOUND: 'Category not found.',
  FORBIDDEN: 'You do not have access to this category.',
  SYSTEM_CATEGORY_DELETE_DENIED: 'System categories cannot be deleted.',
  IN_USE: 'Category is in use and cannot be deleted.',
  CONFLICT: 'Category with this name and type already exists.',
  TYPE_CHANGE_DENIED: 'Cannot change category type because it is in use by transactions.',
};
