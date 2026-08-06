const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://zentra_user:zentra_pass@localhost:5432/zentra_db',
});

const sql = `
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "citext";

-- Core Tables
CREATE TABLE IF NOT EXISTS users (
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

-- Authentication Tables
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id UUID CONSTRAINT pk_refresh_tokens PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    revoked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token_hash ON refresh_tokens(token_hash);
`;

async function setup() {
  try {
    console.log('Connecting to database...');
    await pool.query(sql);
    console.log('✅ Database tables created successfully!');
  } catch (err) {
    console.error('❌ Failed to create tables:', err.message);
  } finally {
    await pool.end();
  }
}

setup();
