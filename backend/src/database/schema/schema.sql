-- Zentra Database Schema

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "citext";
CREATE EXTENSION IF NOT EXISTS "unaccent";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
CREATE EXTENSION IF NOT EXISTS "vector";

-- Create Enums
CREATE TYPE transaction_type AS ENUM ('income', 'expense', 'transfer');
CREATE TYPE category_type AS ENUM ('income', 'expense');
CREATE TYPE budget_status AS ENUM ('active', 'completed', 'expired');
CREATE TYPE budget_period AS ENUM ('monthly', 'weekly', 'yearly');
CREATE TYPE goal_status AS ENUM ('active', 'completed', 'cancelled');
CREATE TYPE notification_type AS ENUM ('system', 'security', 'goal', 'budget', 'transaction', 'ai');
CREATE TYPE notification_priority AS ENUM ('low', 'medium', 'high');
CREATE TYPE import_status AS ENUM ('pending', 'processing', 'completed', 'failed');
CREATE TYPE payment_method AS ENUM ('cash', 'card', 'bank_transfer', 'upi');
CREATE TYPE transaction_source AS ENUM ('manual', 'csv', 'sms', 'api');
CREATE TYPE payment_intent_status AS ENUM ('pending', 'completed', 'failed');
CREATE TYPE insight_type AS ENUM ('spending_analysis', 'budget_warning', 'goal_prediction', 'general');
CREATE TYPE theme_preference AS ENUM ('light', 'dark', 'system');

-- Core Tables
CREATE TABLE users (
    id UUID CONSTRAINT pk_users PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR NOT NULL,
    email VARCHAR NOT NULL CONSTRAINT uq_users_email UNIQUE,
    password_hash TEXT NOT NULL,
    phone VARCHAR,
    avatar_url TEXT,
    currency VARCHAR DEFAULT 'USD',
    timezone VARCHAR DEFAULT 'UTC',
    language VARCHAR DEFAULT 'en',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ
);

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

CREATE TABLE transactions (
    id UUID CONSTRAINT pk_transactions PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE RESTRICT,
    amount NUMERIC NOT NULL CHECK (amount > 0),
    transaction_type transaction_type NOT NULL,
    payment_method payment_method,
    merchant_name VARCHAR,
    source transaction_source,
    description TEXT,
    notes TEXT,
    transaction_date TIMESTAMPTZ NOT NULL,
    attachment_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ
);

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

-- Authentication Tables
CREATE TABLE refresh_tokens (
    id UUID CONSTRAINT pk_refresh_tokens PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    revoked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Finance Tables
CREATE TABLE payment_intents (
    id UUID CONSTRAINT pk_payment_intents PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount NUMERIC NOT NULL CHECK (amount > 0),
    merchant_name VARCHAR NOT NULL,
    upi_id VARCHAR NOT NULL,
    status payment_intent_status NOT NULL DEFAULT 'pending',
    payment_reference VARCHAR NOT NULL CONSTRAINT uq_payment_reference UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- AI Tables
CREATE TABLE ai_insights (
    id UUID CONSTRAINT pk_ai_insights PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR NOT NULL,
    message TEXT NOT NULL,
    insight_type insight_type NOT NULL,
    priority notification_priority NOT NULL,
    generated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMPTZ,
    viewed_at TIMESTAMPTZ
);

CREATE TABLE ai_conversations (
    id UUID CONSTRAINT pk_ai_conversations PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    conversation_id UUID NOT NULL,
    role VARCHAR NOT NULL,
    message TEXT NOT NULL,
    model VARCHAR,
    token_usage INTEGER,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ai_embeddings (
    id UUID CONSTRAINT pk_ai_embeddings PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    conversation_id UUID NOT NULL,
    embedding vector(1536),
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Import Tables
CREATE TABLE csv_imports (
    id UUID CONSTRAINT pk_csv_imports PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    filename VARCHAR NOT NULL,
    bank_name VARCHAR,
    total_records INTEGER DEFAULT 0,
    imported_records INTEGER DEFAULT 0,
    failed_records INTEGER DEFAULT 0,
    status import_status NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sms_imports (
    id UUID CONSTRAINT pk_sms_imports PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    sender VARCHAR,
    message TEXT,
    parsed BOOLEAN DEFAULT false,
    transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
    sms_count INTEGER,
    detected_transactions INTEGER,
    imported_transactions INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Notification Tables
CREATE TABLE notifications (
    id UUID CONSTRAINT pk_notifications PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR NOT NULL,
    message TEXT NOT NULL,
    notification_type notification_type NOT NULL,
    priority notification_priority,
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- System Tables
CREATE TABLE user_settings (
    id UUID CONSTRAINT pk_user_settings PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL CONSTRAINT uq_user_settings_user UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    theme theme_preference DEFAULT 'system',
    language VARCHAR DEFAULT 'en',
    currency VARCHAR DEFAULT 'USD',
    notifications_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE reports (
    id UUID CONSTRAINT pk_reports PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    report_type VARCHAR NOT NULL,
    parameters JSONB,
    file_url TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_users_created_at ON users(created_at);
CREATE INDEX idx_categories_user ON categories(user_id);
CREATE INDEX idx_categories_type ON categories(type);
CREATE INDEX idx_transactions_user ON transactions(user_id);
CREATE INDEX idx_transactions_category ON transactions(category_id);
CREATE INDEX idx_transactions_date ON transactions(transaction_date);
CREATE INDEX idx_transactions_type ON transactions(transaction_type);
CREATE INDEX idx_transactions_source ON transactions(source);
CREATE INDEX idx_transactions_payment_method ON transactions(payment_method);
CREATE INDEX idx_transactions_active ON transactions(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_transactions_user_date ON transactions(user_id, transaction_date);
CREATE INDEX idx_transactions_user_category ON transactions(user_id, category_id);
CREATE INDEX idx_transactions_user_type ON transactions(user_id, transaction_type);
CREATE INDEX idx_transactions_user_payment ON transactions(user_id, payment_method);
CREATE INDEX idx_budgets_user ON budgets(user_id);
CREATE INDEX idx_budgets_category ON budgets(category_id);
CREATE INDEX idx_goals_user ON goals(user_id);
CREATE INDEX idx_goals_status ON goals(status);
CREATE INDEX idx_goals_active ON goals(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_payment_user ON payment_intents(user_id);
CREATE INDEX idx_payment_status ON payment_intents(status);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at);
CREATE INDEX idx_notifications_unread ON notifications(user_id) WHERE read_at IS NULL;
CREATE INDEX idx_notifications_user_read ON notifications(user_id, read_at);
CREATE INDEX idx_ai_user ON ai_insights(user_id);
CREATE INDEX idx_ai_priority ON ai_insights(priority);
CREATE INDEX idx_ai_user_priority ON ai_insights(user_id, priority);
CREATE INDEX idx_csv_user ON csv_imports(user_id);
CREATE INDEX idx_csv_status ON csv_imports(status);
CREATE INDEX idx_sms_user ON sms_imports(user_id);
CREATE INDEX idx_refresh_user ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_expiry ON refresh_tokens(expires_at);