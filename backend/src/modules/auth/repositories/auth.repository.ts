import { db } from '../../../database/connection';
import { DatabaseError } from '../../../common/errors';

export interface UserRecord {
  id: string;
  full_name: string;
  email: string;
  password_hash: string;
  phone?: string;
  avatar_url?: string;
  currency?: string;
  timezone?: string;
  language?: string;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}

export interface RefreshTokenRecord {
  id: string;
  user_id: string;
  token_hash: string;
  expires_at: Date;
  revoked_at?: Date;
  created_at: Date;
}

export class AuthRepository {
  async createUser(fullName: string, email: string, passwordHash: string): Promise<UserRecord> {
    try {
      const query = `
        INSERT INTO users (full_name, email, password_hash)
        VALUES ($1, $2, $3)
        RETURNING *;
      `;
      const result = await db.query(query, [fullName, email, passwordHash]);
      return result.rows[0];
    } catch (error: any) {
      throw new DatabaseError(`Failed to create user: ${error.message}`);
    }
  }

  async findUserByEmail(email: string): Promise<UserRecord | null> {
    try {
      const query = `
        SELECT * FROM users
        WHERE email = $1 AND deleted_at IS NULL;
      `;
      const result = await db.query(query, [email]);
      return result.rows[0] || null;
    } catch (error: any) {
      throw new DatabaseError(`Failed to find user by email: ${error.message}`);
    }
  }

  async findUserById(id: string): Promise<UserRecord | null> {
    try {
      const query = `
        SELECT * FROM users
        WHERE id = $1 AND deleted_at IS NULL;
      `;
      const result = await db.query(query, [id]);
      return result.rows[0] || null;
    } catch (error: any) {
      throw new DatabaseError(`Failed to find user by ID: ${error.message}`);
    }
  }

  async createRefreshToken(userId: string, tokenHash: string, expiresAt: Date): Promise<RefreshTokenRecord> {
    try {
      const query = `
        INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
        VALUES ($1, $2, $3)
        RETURNING *;
      `;
      const result = await db.query(query, [userId, tokenHash, expiresAt]);
      return result.rows[0];
    } catch (error: any) {
      throw new DatabaseError(`Failed to create refresh token: ${error.message}`);
    }
  }

  async findRefreshToken(tokenHash: string): Promise<RefreshTokenRecord | null> {
    try {
      const query = `
        SELECT * FROM refresh_tokens
        WHERE token_hash = $1 AND revoked_at IS NULL;
      `;
      const result = await db.query(query, [tokenHash]);
      return result.rows[0] || null;
    } catch (error: any) {
      throw new DatabaseError(`Failed to find refresh token: ${error.message}`);
    }
  }

  async revokeRefreshToken(tokenHash: string): Promise<void> {
    try {
      const query = `
        UPDATE refresh_tokens
        SET revoked_at = CURRENT_TIMESTAMP
        WHERE token_hash = $1 AND revoked_at IS NULL;
      `;
      await db.query(query, [tokenHash]);
    } catch (error: any) {
      throw new DatabaseError(`Failed to revoke refresh token: ${error.message}`);
    }
  }

  async revokeAllUserRefreshTokens(userId: string): Promise<void> {
    try {
      const query = `
        UPDATE refresh_tokens
        SET revoked_at = CURRENT_TIMESTAMP
        WHERE user_id = $1 AND revoked_at IS NULL;
      `;
      await db.query(query, [userId]);
    } catch (error: any) {
      throw new DatabaseError(`Failed to revoke all user refresh tokens: ${error.message}`);
    }
  }
}

export const authRepository = new AuthRepository();
