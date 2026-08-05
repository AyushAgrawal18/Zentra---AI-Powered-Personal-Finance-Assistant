CREATE TABLE goals (
    id UUID CONSTRAINT pk_goals PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR NOT NULL,
    description TEXT,
    target_amount NUMERIC NOT NULL CHECK (target_amount > 0),
    current_amount NUMERIC NOT NULL DEFAULT 0,
    target_date DATE NOT NULL,
    status goal_status NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ
);
CREATE INDEX idx_goals_user ON goals(user_id);
CREATE INDEX idx_goals_status ON goals(status);
CREATE INDEX idx_goals_active ON goals(user_id) WHERE deleted_at IS NULL;