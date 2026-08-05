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
CREATE INDEX idx_users_created_at ON users(created_at);

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

CREATE TABLE refresh_tokens (
    id UUID CONSTRAINT pk_refresh_tokens PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    revoked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_refresh_user ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_expiry ON refresh_tokens(expires_at);