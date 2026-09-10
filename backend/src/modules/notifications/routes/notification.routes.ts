import { Router } from "express";
import { authenticate } from "../../../common/middleware/auth";
import { validate } from "../../../common/middleware/validate";
import {
  notificationIdParamSchema,
  listNotificationsSchema,
  notificationPreferencesSchema,
} from "../validators";
import {
  deleteNotification,
  getNotification,
  getNotificationPreferences,
  getUnreadCount,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  updateNotificationPreferences,
} from "../controllers";

const router = Router();
router.get(
  "/",
  authenticate,
  validate(listNotificationsSchema),
  listNotifications,
);
router.get("/unread-count", authenticate, getUnreadCount);
router.patch("/read-all", authenticate, markAllNotificationsRead);
router.get("/preferences", authenticate, getNotificationPreferences);
router.patch(
  "/preferences",
  authenticate,
  validate(notificationPreferencesSchema),
  updateNotificationPreferences,
);
router.get(
  "/:id",
  authenticate,
  validate(notificationIdParamSchema),
  getNotification,
);
router.patch(
  "/:id/read",
  authenticate,
  validate(notificationIdParamSchema),
  markNotificationRead,
);
router.delete(
  "/:id",
  authenticate,
  validate(notificationIdParamSchema),
  deleteNotification,
);

export default router;
