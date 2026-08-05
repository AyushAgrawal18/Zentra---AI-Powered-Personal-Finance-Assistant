---
title: Settings API

module: api

version: 1.0.0

status: Locked

priority: High

owner: Backend Team

related_docs:
  - api_overview.md
  - authentication.md
  - errors.md
  - ../development/features/settings.md
  - profile.md
---

# Settings API

> This document defines every endpoint related to user application settings, including appearance, localization, privacy, security, notification preferences, and application behavior.

---

# Table of Contents

1. Purpose
2. Authentication
3. Endpoints
4. Settings Model
5. Get Settings
6. Update Settings
7. Reset Settings
8. Validation Rules
9. Response Examples
10. Error Responses
11. Business Rules
12. Design Principles

---

# 1. Purpose

The Settings API allows users to customize how Zentra behaves.

Version 1 supports:

- Theme
- Currency
- Language
- Timezone
- Notification Preferences
- Privacy Preferences

Authentication and profile information are managed separately.

---

# 2. Authentication

All settings endpoints require authentication.

```
Authorization: Bearer <access_token>
```

Users may manage only their own settings.

---

# 3. Endpoints

| Method | Endpoint | Description |
|---------|----------|-------------|
| GET | /settings | Get user settings |
| PATCH | /settings | Update settings |
| POST | /settings/reset | Restore default settings |

---

# 4. Settings Model

A settings object contains:

- Theme
- Currency
- Language
- Timezone
- Date Format
- Notification Preferences
- Privacy Preferences

Supported themes:

- LIGHT
- DARK
- SYSTEM

---

# 5. Get Settings

## Endpoint

```http
GET /api/v1/settings
```

Returns all configurable application settings.

---

# 6. Update Settings

## Endpoint

```http
PATCH /api/v1/settings
```

### Request

```json
{
  "theme": "DARK",
  "currency": "INR",
  "language": "en",
  "timezone": "Asia/Kolkata",
  "notifications": {
    "budgetAlerts": true,
    "goalUpdates": true,
    "paymentUpdates": true,
    "aiInsights": true
  },
  "privacy": {
    "shareAnalytics": false
  }
}
```

Only supplied fields are updated.

---

# 7. Reset Settings

## Endpoint

```http
POST /api/v1/settings/reset
```

Restores all settings to the default values.

Example Response

```json
{
  "success": true,
  "message": "Settings reset successfully."
}
```

---

# 8. Validation Rules

Validation includes:

- Theme must be supported.
- Currency must be supported.
- Language must be supported.
- Timezone must be valid.
- Date format must be supported.
- Privacy settings must use valid values.

Validation failures return HTTP 422.

---

# 9. Response Examples

```json
{
  "success": true,
  "data": {
    "theme": "DARK",
    "currency": "INR",
    "language": "en",
    "timezone": "Asia/Kolkata",
    "dateFormat": "DD-MM-YYYY",
    "notifications": {
      "budgetAlerts": true,
      "goalUpdates": true,
      "paymentUpdates": true,
      "aiInsights": true
    },
    "privacy": {
      "shareAnalytics": false
    }
  }
}
```

---

# 10. Error Responses

| HTTP | Error Code |
|------|------------|
| 400 | BAD_REQUEST |
| 401 | UNAUTHORIZED |
| 403 | FORBIDDEN |
| 422 | VALIDATION_ERROR |
| 500 | INTERNAL_SERVER_ERROR |

Responses follow `errors.md`.

---

# 11. Business Rules

- Users may modify only their own settings.
- Reset restores only configurable preferences.
- Settings changes take effect immediately unless otherwise specified.
- Notification preferences affect only future notifications.
- Settings are synchronized across all supported Zentra clients.

---

# 12. Design Principles

- User ownership enforcement
- Immediate preference updates
- Strong validation
- Consistent response format
- Cross-platform compatibility
- Clear separation from profile and authentication

---

# References

- api_overview.md
- authentication.md
- errors.md
- profile.md
- ../development/features/settings.md

---

> **API Principle:** The Settings API centralizes application configuration while keeping user identity and authentication concerns separate. Every configurable preference should be synchronized across supported clients and applied consistently throughout Zentra.