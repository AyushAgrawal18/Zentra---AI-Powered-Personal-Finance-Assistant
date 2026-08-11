DROP INDEX IF EXISTS uq_budgets_user_month_year_overall;
DROP INDEX IF EXISTS uq_budgets_user_cat_month_year;
DROP INDEX IF EXISTS idx_budgets_user_month_year;

ALTER TABLE budgets DROP COLUMN IF EXISTS year;
ALTER TABLE budgets DROP COLUMN IF EXISTS month;
ALTER TABLE budgets DROP COLUMN IF EXISTS alert_threshold;
ALTER TABLE budgets DROP COLUMN IF EXISTS name;
