import { env } from './env';

export const dbConfig = {
  connectionString: env.DATABASE_URL,
  ssl: env.DATABASE_SSL ? { rejectUnauthorized: false } : undefined,
  max: 20, // Connection pool max size
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};
