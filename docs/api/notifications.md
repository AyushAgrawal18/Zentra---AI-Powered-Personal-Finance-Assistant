# Notifications API

---

title: Notifications API

module: api

version: 1.0.0

status: Locked

priority: Critical

owner: Backend Team

related_docs:

- api_overview.md
- authentication.md
- pagination.md
- errors.md
- ../development/features/notifications.md

---

# Notifications API

> This document defines every endpoint related to user notifications in Zentra, including notification retrieval, unread counts, read status, preferences, and notification history.

---

# Table of Contents

1. Purpose
2. Authentication
3. Notification Types
4. Endpoints
5. Notification Model
6. Get Notifications
7. Get Notification
8. Mark as Read
9. Mark All as Read
10. Notification Preferences
11. Delete Notification
12. Query Parameters
13. Validation Rules
14. Response Examples
15. Error Responses
16. Business Rules
17. Design Principles

---

# 1. Purpose

The Notifications API provides users with timely financial updates and system alerts.

Version 1 supports:

- Budget Alerts
- Goal Updates
- AI Insights
- Payment Updates
- Import Notifications
- System Announcements

Notifications are generated automatically by backend services.

---

# 2. Authentication

All notification endpoints require authentication.

```
Authorization: Bearer <access_token>
```

Users may access only their own notifications.

---

# 3. Notification Types

Supported notification categories:

- SYSTEM
- SECURITY
- GOAL
- BUDGET
- TRANSACTION
- AI

Supported priorities:

- LOW
- MEDIUM
- HIGH

These values match the locked PostgreSQL enums. Payment, import, and AI
insight events use the corresponding schema-backed categories when event
producers are added. `CRITICAL` is not currently supported by the database.

---

# 4. Endpoints

| Method | Endpoint                    | Description              |
| ------ | --------------------------- | ------------------------ |
| GET    | /notifications              | List notifications       |
| GET    | /notifications/{id}         | Get notification         |
| PATCH  | /notifications/{id}/read    | Mark as read             |
| PATCH  | /notifications/read-all     | Mark all as read         |
| GET    | /notifications/unread-count | Unread count             |
| GET    | /notifications/preferences  | Notification preferences |
| PATCH  | /notifications/preferences  | Update preferences       |
| DELETE | /notifications/{id}         | Delete notification      |

---

# 5. Notification Model

A notification contains:

- Title
- Message
- Type
- Priority
- Read Status
- Created Time
- Read Time

Notifications are immutable except for their read status.

---

# 6. Get Notifications

## Endpoint

```http
GET /api/v1/notifications
```

Supports:

- Pagination
- Filtering
- Sorting

Example

```http
GET /notifications?type=BUDGET&status=UNREAD
```

---

# 7. Get Notification

## Endpoint

```http
GET /api/v1/notifications/{id}
```

Returns complete notification details.

---

# 8. Mark as Read

## Endpoint

```http
PATCH /api/v1/notifications/{id}/read
```

Example Response

```json
{
  "success": true,
  "message": "Notification marked as read."
}
```

---

# 9. Mark All as Read

## Endpoint

```http
PATCH /api/v1/notifications/read-all
```

Marks every unread notification for the authenticated user as read.

---

# 10. Notification Preferences

## Get Preferences

```http
GET /api/v1/notifications/preferences
```

## Update Preferences

```http
PATCH /api/v1/notifications/preferences
```

Example Request

```json
{
  "notificationsEnabled": false
}
```

---

# 11. Delete Notification

## Endpoint

```http
DELETE /api/v1/notifications/{id}
```

Deletes a notification from the user's notification list.

System audit records remain unaffected.

---

# 12. Query Parameters

| Parameter | Description           |
| --------- | --------------------- |
| type      | Notification category |
| priority  | Notification priority |
| status    | READ / UNREAD         |
| page      | Page number           |
| limit     | Page size             |
| sort      | Sort field            |
| order     | asc / desc            |

---

# 13. Validation Rules

Validation includes:

- Notification must exist.
- Notification must belong to the authenticated user.
- Only supported notification types are accepted.
- Only supported preference fields may be updated.

Validation failures return HTTP 422.

---

# 14. Response Examples

Notification

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Budget Alert",
    "message": "You have used 90% of your Food budget.",
    "type": "BUDGET",
    "priority": "HIGH",
    "read": false,
    "createdAt": "2026-08-01T10:30:00Z"
  }
}
```

Unread Count

```json
{
  "success": true,
  "data": {
    "count": 7
  }
}
```

---

# 15. Error Responses

| HTTP | Error Code             |
| ---- | ---------------------- |
| 400  | BAD_REQUEST            |
| 401  | UNAUTHORIZED           |
| 403  | FORBIDDEN              |
| 404  | NOTIFICATION_NOT_FOUND |
| 422  | VALIDATION_ERROR       |
| 500  | INTERNAL_SERVER_ERROR  |

All responses follow `errors.md`.

---

# 16. Business Rules

- Users may access only their own notifications.
- Notifications are created by backend events.
- Notifications cannot be edited.
- Read status may be updated.
- Notifications may be removed from the user's view without affecting audit history.
- Notification preferences apply only to future notifications.

---

# 17. Design Principles

- Event-driven generation
- User ownership enforcement
- Immutable notification content
- Configurable preferences
- Consistent response format
- Strong validation

---

# References

- api_overview.md
- authentication.md
- pagination.md
- errors.md
- ../development/features/notifications.md

---

> **API Principle:** Notifications keep users informed about important financial events without interrupting their workflow. Every notification is generated from verified system events, delivered consistently, and remains fully controlled by the authenticated user.
