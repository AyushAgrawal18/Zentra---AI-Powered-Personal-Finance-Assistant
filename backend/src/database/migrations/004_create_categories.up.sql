CREATE TABLE categories (
    id UUID CONSTRAINT pk_categories PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR NOT NULL,
    type category_type NOT NULL,
    icon VARCHAR,
    color VARCHAR,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ
);
CREATE INDEX idx_categories_user ON categories(user_id);
CREATE INDEX idx_categories_type ON categories(type);