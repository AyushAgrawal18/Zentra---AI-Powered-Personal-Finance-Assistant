ALTER TABLE categories RENAME COLUMN is_system TO is_default;
DELETE FROM categories WHERE user_id IS NULL;
ALTER TABLE categories ALTER COLUMN user_id SET NOT NULL;
