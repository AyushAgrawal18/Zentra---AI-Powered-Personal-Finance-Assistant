const { Pool } = require('pg');

// Try default postgres user first
const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'postgres',
  database: 'postgres',
});

const sql = `
-- Create our database user and database if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'zentra_user') THEN
    CREATE ROLE zentra_user WITH LOGIN PASSWORD 'zentra_pass';
  END IF;
END
$$;

-- Create the database
SELECT 'CREATE DATABASE zentra_db OWNER zentra_user'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'zentra_db');
`;

async function setup() {
  try {
    console.log('Step 1: Connecting as postgres...');
    
    // Check if zentra_db exists
    const dbCheck = await pool.query("SELECT 1 FROM pg_database WHERE datname = 'zentra_db'");
    
    if (dbCheck.rows.length === 0) {
      // Create user
      try {
        await pool.query("CREATE ROLE zentra_user WITH LOGIN PASSWORD 'zentra_pass'");
        console.log('  Created user zentra_user');
      } catch (e) {
        if (e.code === '42710') console.log('  User zentra_user already exists');
        else throw e;
      }
      
      // Create database
      await pool.query('CREATE DATABASE zentra_db OWNER zentra_user');
      console.log('  Created database zentra_db');
    } else {
      console.log('  Database zentra_db already exists');
    }
    
    await pool.end();
    
    // Now connect to zentra_db and create tables
    console.log('Step 2: Creating tables...');
    const zentraPool = new Pool({
      host: 'localhost',
      port: 5432,
      user: 'zentra_user',
      password: 'zentra_pass',
      database: 'zentra_db',
    });
    
    await zentraPool.query(`
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
      CREATE EXTENSION IF NOT EXISTS "pgcrypto";

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

      CREATE TABLE IF NOT EXISTS refresh_tokens (
          id UUID CONSTRAINT pk_refresh_tokens PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          token_hash TEXT NOT NULL,
          expires_at TIMESTAMPTZ NOT NULL,
          revoked_at TIMESTAMPTZ,
          created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);
      CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token_hash ON refresh_tokens(token_hash);
    `);
    
    console.log('  Tables created successfully!');
    await zentraPool.end();
    console.log('Done! Database is ready.');
    
  } catch (err) {
    console.error('Error:', err.message);
    console.log('');
    console.log('If "password authentication failed", you need to set POSTGRES_PASSWORD');
    console.log('when creating the Docker container. Delete the container in Docker Desktop');
    console.log('and recreate it with Environment Variable: POSTGRES_PASSWORD = postgres');
    await pool.end();
  }
}

setup();
