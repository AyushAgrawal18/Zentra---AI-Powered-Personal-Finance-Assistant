const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'zentra_user',
  password: 'zentra_pass',
  database: 'zentra_db',
});

async function run() {
  try {
    // Step 1: Alter categories table — allow NULL user_id and rename is_default→is_system
    // Each statement is wrapped to be safe/idempotent
    try {
      await pool.query(`ALTER TABLE categories ALTER COLUMN user_id DROP NOT NULL;`);
      console.log('✓ Dropped NOT NULL on user_id');
    } catch (e) {
      if (e.message.includes('already nullable') || e.message.includes('does not exist')) {
        console.log('  user_id already nullable, skipping');
      } else console.error('  ALTER user_id:', e.message);
    }

    try {
      await pool.query(`ALTER TABLE categories RENAME COLUMN is_default TO is_system;`);
      console.log('✓ Renamed is_default → is_system');
    } catch (e) {
      if (e.message.includes('is_system') || e.message.includes('does not exist')) {
        console.log('  Column already renamed, skipping');
      } else console.error('  RENAME column:', e.message);
    }

    // Step 2: Seed system categories (INSERT ... ON CONFLICT DO NOTHING requires unique constraint)
    // We check by name+type to avoid duplicates
    const systemCategories = [
      { name: 'Salary',        type: 'income',  icon: 'briefcase', color: '#4CAF50' },
      { name: 'Freelance',     type: 'income',  icon: 'laptop',    color: '#8BC34A' },
      { name: 'Investment',    type: 'income',  icon: 'trending-up', color: '#00BCD4' },
      { name: 'Food',          type: 'expense', icon: 'utensils',  color: '#FF9800' },
      { name: 'Transport',     type: 'expense', icon: 'car',       color: '#2196F3' },
      { name: 'Shopping',      type: 'expense', icon: 'shopping-bag', color: '#9C27B0' },
      { name: 'Entertainment', type: 'expense', icon: 'film',      color: '#F44336' },
      { name: 'Utilities',     type: 'expense', icon: 'zap',       color: '#607D8B' },
      { name: 'Health',        type: 'expense', icon: 'heart',     color: '#E91E63' },
      { name: 'Education',     type: 'expense', icon: 'book',      color: '#3F51B5' },
    ];

    for (const cat of systemCategories) {
      const existing = await pool.query(
        `SELECT 1 FROM categories WHERE user_id IS NULL AND LOWER(name) = LOWER($1) AND type = $2`,
        [cat.name, cat.type]
      );
      if (existing.rowCount === 0) {
        await pool.query(
          `INSERT INTO categories (user_id, name, type, icon, color, is_system) VALUES (NULL, $1, $2, $3, $4, true)`,
          [cat.name, cat.type, cat.icon, cat.color]
        );
        console.log(`✓ Seeded system category: ${cat.name}`);
      } else {
        console.log(`  Skipping existing: ${cat.name}`);
      }
    }

    console.log('\n✅ Migration 013 complete!');
  } catch (e) {
    console.error('Migration failed:', e.message);
  } finally {
    pool.end();
  }
}
run();

