CREATE TABLE budgets (
    id UUID CONSTRAINT pk_budgets PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    amount NUMERIC NOT NULL CHECK (amount > 0),
    spent_amount NUMERIC DEFAULT 0,
    remaining_amount NUMERIC,
    period budget_period,
    start_date DATE,
    end_date DATE,
    status budget_status,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ
);
CREATE INDEX idx_budgets_user ON budgets(user_id);
CREATE INDEX idx_budgets_category ON budgets(category_id);