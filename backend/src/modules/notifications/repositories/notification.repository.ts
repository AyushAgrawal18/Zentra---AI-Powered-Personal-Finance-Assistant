import { db } from "../../../database/connection";
import { DatabaseError } from "../../../common/errors";
import { NOTIFICATION_SORT_FIELDS } from "../constants";
import { NotificationRecord } from "../dto";

export interface ListNotificationsParams {
  userId: string;
  page: number;
  limit: number;
  type?: string;
  priority?: string;
  status?: string;
  sort?: string;
  order?: string;
}

export class NotificationRepository {
  async create(params: {
    userId: string;
    title: string;
    message: string;
    type: string;
    priority?: string;
  }): Promise<NotificationRecord | null> {
    try {
      const enabled = await db.query(
        "SELECT notifications_enabled FROM user_settings WHERE user_id = $1;",
        [params.userId],
      );
      if (enabled.rows[0] && enabled.rows[0].notifications_enabled === false)
        return null;
      const result = await db.query(
        `INSERT INTO notifications (user_id, title, message, notification_type, priority)
         VALUES ($1, $2, $3, $4, $5) RETURNING *;`,
        [
          params.userId,
          params.title,
          params.message,
          params.type,
          params.priority ?? "medium",
        ],
      );
      return result.rows[0];
    } catch (error: any) {
      throw new DatabaseError(
        `Failed to create notification: ${error.message}`,
      );
    }
  }

  async findById(
    id: string,
    userId: string,
  ): Promise<NotificationRecord | null> {
    try {
      const result = await db.query(
        `SELECT * FROM notifications WHERE id = $1 AND user_id = $2;`,
        [id, userId],
      );
      return result.rows[0] ?? null;
    } catch (error: any) {
      throw new DatabaseError(`Failed to find notification: ${error.message}`);
    }
  }

  async list(
    params: ListNotificationsParams,
  ): Promise<{ rows: NotificationRecord[]; total: number }> {
    try {
      const conditions = ["n.user_id = $1"];
      const values: any[] = [params.userId];
      let index = 2;
      if (params.type) {
        conditions.push(`n.notification_type = $${index++}`);
        values.push(params.type);
      }
      if (params.priority) {
        conditions.push(`n.priority = $${index++}`);
        values.push(params.priority);
      }
      if (params.status) {
        conditions.push(
          params.status.toLowerCase() === "unread"
            ? "n.read_at IS NULL"
            : "n.read_at IS NOT NULL",
        );
      }
      const where = `WHERE ${conditions.join(" AND ")}`;
      const count = await db.query(
        `SELECT COUNT(*) FROM notifications n ${where};`,
        values,
      );
      const total = Number.parseInt(count.rows[0].count, 10);
      const requestedSort = params.sort ?? "created_at";
      const sortField =
        NOTIFICATION_SORT_FIELDS[requestedSort] ??
        NOTIFICATION_SORT_FIELDS.created_at;
      const sortOrder =
        (params.order ?? "desc").toUpperCase() === "ASC" ? "ASC" : "DESC";
      const order =
        sortField === "priority"
          ? `CASE n.priority WHEN 'high' THEN 3 WHEN 'medium' THEN 2 WHEN 'low' THEN 1 ELSE 0 END ${sortOrder}, n.created_at DESC`
          : `n.${sortField} ${sortOrder}`;
      const result = await db.query(
        `SELECT n.* FROM notifications n ${where} ORDER BY ${order}
         LIMIT $${index} OFFSET $${index + 1};`,
        [...values, params.limit, (params.page - 1) * params.limit],
      );
      return { rows: result.rows, total };
    } catch (error: any) {
      throw new DatabaseError(`Failed to list notifications: ${error.message}`);
    }
  }

  async unreadCount(userId: string): Promise<number> {
    try {
      const result = await db.query(
        "SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND read_at IS NULL;",
        [userId],
      );
      return Number.parseInt(result.rows[0].count, 10);
    } catch (error: any) {
      throw new DatabaseError(
        `Failed to count unread notifications: ${error.message}`,
      );
    }
  }

  async markRead(id: string, userId: string): Promise<boolean> {
    try {
      const result = await db.query(
        `UPDATE notifications SET is_read = true, read_at = CURRENT_TIMESTAMP WHERE id = $1 AND user_id = $2 AND read_at IS NULL;`,
        [id, userId],
      );
      return (result.rowCount ?? 0) > 0;
    } catch (error: any) {
      throw new DatabaseError(
        `Failed to mark notification read: ${error.message}`,
      );
    }
  }

  async markAllRead(userId: string): Promise<number> {
    try {
      const result = await db.query(
        `UPDATE notifications SET is_read = true, read_at = CURRENT_TIMESTAMP WHERE user_id = $1 AND read_at IS NULL;`,
        [userId],
      );
      return result.rowCount ?? 0;
    } catch (error: any) {
      throw new DatabaseError(
        `Failed to mark notifications read: ${error.message}`,
      );
    }
  }

  async delete(id: string, userId: string): Promise<boolean> {
    try {
      const result = await db.query(
        "DELETE FROM notifications WHERE id = $1 AND user_id = $2;",
        [id, userId],
      );
      return (result.rowCount ?? 0) > 0;
    } catch (error: any) {
      throw new DatabaseError(
        `Failed to delete notification: ${error.message}`,
      );
    }
  }

  async getPreferences(userId: string): Promise<boolean> {
    try {
      const result = await db.query(
        "SELECT notifications_enabled FROM user_settings WHERE user_id = $1;",
        [userId],
      );
      return result.rows[0]?.notifications_enabled ?? true;
    } catch (error: any) {
      throw new DatabaseError(
        `Failed to get notification preferences: ${error.message}`,
      );
    }
  }

  async updatePreferences(userId: string, enabled: boolean): Promise<boolean> {
    try {
      const result = await db.query(
        `INSERT INTO user_settings (user_id, notifications_enabled) VALUES ($1, $2)
         ON CONFLICT (user_id) DO UPDATE SET notifications_enabled = EXCLUDED.notifications_enabled,
         updated_at = CURRENT_TIMESTAMP RETURNING notifications_enabled;`,
        [userId, enabled],
      );
      return result.rows[0].notifications_enabled;
    } catch (error: any) {
      throw new DatabaseError(
        `Failed to update notification preferences: ${error.message}`,
      );
    }
  }
}

export const notificationRepository = new NotificationRepository();
