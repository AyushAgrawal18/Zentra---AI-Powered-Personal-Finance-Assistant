import { z } from "zod";
import {
  listNotificationsSchema,
  notificationPreferencesSchema,
} from "../validators";

export type ListNotificationsQueryDTO = z.infer<
  typeof listNotificationsSchema
>["query"];
export type NotificationPreferencesDTO = z.infer<
  typeof notificationPreferencesSchema
>["body"];

export interface NotificationRecord {
  id: string;
  user_id: string;
  title: string;
  message: string;
  notification_type: string;
  priority: string | null;
  is_read: boolean;
  read_at: Date | null;
  created_at: Date;
}

export interface NotificationResponseDTO {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  priority: string | null;
  read: boolean;
  createdAt: string;
  readAt: string | null;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface NotificationPreferencesResponseDTO {
  notificationsEnabled: boolean;
}
