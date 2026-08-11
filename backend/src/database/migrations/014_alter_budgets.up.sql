ALTER TABLE budgets ADD COLUMN IF NOT EXISTS name VARCHAR(255);
ALTER TABLE budgets ADD COLUMN IF NOT EXISTS alert_threshold INTEGER DEFAULT 80 CHECK (alert_threshold >= 1 AND alert_threshold <= 100);
ALTER TABLE budgets ADD COLUMN IF NOT EXISTS month INTEGER CHECK (month >= 1 AND month <= 12);
ALTER TABLE budgets ADD COLUMN IF NOT EXISTS year INTEGER CHECK (year >= 1900 AND year <= 2100);

CREATE INDEX IF NOT EXISTS idx_budgets_user_month_year ON budgets(user_id, month, year) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uq_budgets_user_cat_month_year ON budgets (user_id, category_id, month, year) WHERE deleted_at IS NULL AND category_id IS NOT NULL AND month IS NOT NULL AND year IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uq_budgets_user_month_year_overall ON budgets (user_id, month, year) WHERE deleted_at IS NULL AND category_id IS NULL AND month IS NOT NULL AND year IS NOT NULL;
