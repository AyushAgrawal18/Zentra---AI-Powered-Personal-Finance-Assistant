import { Pool } from 'pg';
import { dbConfig } from '../config/database';
import { logger } from '../common/logger';

class Database {
  private static instance: Pool;

  public static getInstance(): Pool {
    if (!Database.instance) {
      Database.instance = new Pool(dbConfig);

      Database.instance.on('error', (err) => {
        logger.error({ err }, 'Unexpected error on idle client');
        process.exit(-1);
      });
    }
    return Database.instance;
  }

  public static async connect(): Promise<void> {
    const pool = Database.getInstance();
    try {
      const client = await pool.connect();
      client.release();
      logger.info('Database connected successfully');
    } catch (err) {
      logger.error({ err }, 'Database connection failed');
      throw err;
    }
  }

  public static async disconnect(): Promise<void> {
    if (Database.instance) {
      await Database.instance.end();
      logger.info('Database disconnected');
    }
  }

  public static async healthCheck(): Promise<boolean> {
    try {
      const pool = Database.getInstance();
      const result = await pool.query('SELECT 1 as healthy');
      return result.rows[0].healthy === 1;
    } catch (err) {
      logger.error({ err }, 'Database health check failed');
      return false;
    }
  }
}

export const db = Database.getInstance();
export const connect = Database.connect;
export const disconnect = Database.disconnect;
export const healthCheck = Database.healthCheck;
