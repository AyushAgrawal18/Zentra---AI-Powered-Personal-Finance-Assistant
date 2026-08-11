ALTER TABLE categories ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE categories RENAME COLUMN is_default TO is_system;
