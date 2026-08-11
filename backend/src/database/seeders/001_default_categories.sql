-- Default initial categories for users
INSERT INTO categories (user_id, name, type, icon, color, is_system)
VALUES
  -- This is a placeholder since user_id is required, in application logic this will be seeded per user
  -- Or default system categories if applicable.
  (NULL, 'Salary', 'income', 'briefcase', '#4CAF50', true),
  (NULL, 'Food', 'expense', 'utensils', '#FF9800', true),
  (NULL, 'Transport', 'expense', 'car', '#2196F3', true);