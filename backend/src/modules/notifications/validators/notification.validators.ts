import { z } from "zod";
import {
  NOTIFICATION_DEFAULT_LIMIT,
  NOTIFICATION_DEFAULT_PAGE,
  NOTIFICATION_MAX_LIMIT,
  NOTIFICATION_PRIORITIES,
  NOTIFICATION_SORT_FIELDS,
  NOTIFICATION_TYPES,
} from "../constants";

const typeValues = Object.values(NOTIFICATION_TYPES) as [string, ...string[]];
const priorityValues = Object.values(NOTIFICATION_PRIORITIES) as [
  string,
  ...string[],
];
const sortValues = Object.keys(NOTIFICATION_SORT_FIELDS) as [
  string,
  ...string[],
];

export const listNotificationsSchema = z.object({
  query: z.object({
    type: z.enum(typeValues).optional(),
    priority: z.enum(priorityValues).optional(),
    status: z.enum(["READ", "UNREAD", "read", "unread"]).optional(),
    page: z
      .string()
      .regex(/^\d+$/)
      .transform(Number)
      .refine((value) => value >= 1)
      .optional()
      .default(String(NOTIFICATION_DEFAULT_PAGE)),
    limit: z
      .string()
      .regex(/^\d+$/)
      .transform(Number)
      .refine((value) => value >= 1 && value <= NOTIFICATION_MAX_LIMIT)
      .optional()
      .default(String(NOTIFICATION_DEFAULT_LIMIT)),
    sort: z.enum(sortValues).optional().default("created_at"),
    order: z.enum(["asc", "desc"]).optional().default("desc"),
  }),
});

export const notificationIdParamSchema = z.object({
  params: z.object({
    id: z.string().uuid("Notification ID must be a valid UUID"),
  }),
});

export const notificationPreferencesSchema = z.object({
  body: z.object({
    notificationsEnabled: z.boolean(),
  }),
});
