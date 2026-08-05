---
title: Profile API

module: api

version: 1.0.0

status: Locked

priority: High

owner: Backend Team

related_docs:
  - api_overview.md
  - authentication.md
  - errors.md
  - ../development/features/profile.md
---

# Profile API

> This document defines every endpoint related to user profile management, including personal information, avatar, preferences, account details, and profile retrieval.

---

# Table of Contents

1. Purpose
2. Authentication
3. Endpoints
4. Profile Model
5. Get Profile
6. Update Profile
7. Upload Avatar
8. Delete Avatar
9. Account Summary
10. Validation Rules
11. Response Examples
12. Error Responses
13. Business Rules
14. Design Principles

---

# 1. Purpose

The Profile API enables users to manage their personal information and account preferences.

Version 1 supports:

- Profile retrieval
- Profile updates
- Avatar management
- Currency selection
- Timezone selection
- Language preference

Authentication credentials are managed separately by the Authentication API.

---

# 2. Authentication

All profile endpoints require authentication.

```
Authorization: Bearer <access_token>
```

Users may access only their own profile.

---

# 3. Endpoints

| Method | Endpoint | Description |
|---------|----------|-------------|
| GET | /profile | Get profile |
| PATCH | /profile | Update profile |
| POST | /profile/avatar | Upload avatar |
| DELETE | /profile/avatar | Remove avatar |
| GET | /profile/account | Account summary |

---

# 4. Profile Model

A user profile contains:

- Full Name
- Email Address
- Avatar URL
- Preferred Currency
- Timezone
- Language
- Account Created Date
- Last Login

System-managed fields:

- User ID
- Email Verification Status
- Account Status
- Created At
- Updated At

---

# 5. Get Profile

## Endpoint

```http
GET /api/v1/profile
```

Returns the authenticated user's profile.

---

# 6. Update Profile

## Endpoint

```http
PATCH /api/v1/profile
```

### Request

```json
{
  "fullName": "Ayush Kumar Agrawal",
  "currency": "INR",
  "timezone": "Asia/Kolkata",
  "language": "en"
}
```

Only supplied fields are updated.

---

# 7. Upload Avatar

## Endpoint

```http
POST /api/v1/profile/avatar
```

Content Type

```http
multipart/form-data
```

Form Field

```
avatar
```

### Success Response

```json
{
  "success": true,
  "message": "Avatar uploaded successfully.",
  "data": {
    "avatarUrl": "https://cdn.zentra.app/avatars/user.png"
  }
}
```

Supported formats:

- PNG
- JPG
- JPEG
- WebP

---

# 8. Delete Avatar

## Endpoint

```http
DELETE /api/v1/profile/avatar
```

Removes the current avatar and restores the default profile image.

---

# 9. Account Summary

## Endpoint

```http
GET /api/v1/profile/account
```

Returns:

- Account Creation Date
- Email Verification Status
- Account Status
- Total Transactions
- Total Budgets
- Total Goals

---

# 10. Validation Rules

Validation includes:

- Full name is required.
- Currency must be supported.
- Timezone must be valid.
- Language must be supported.
- Avatar must be an image.
- Avatar size must not exceed configured limits.

Validation failures return HTTP 422.

---

# 11. Response Examples

Profile

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "fullName": "Ayush Kumar Agrawal",
    "email": "ayush@example.com",
    "avatarUrl": "https://cdn.zentra.app/avatar.png",
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "language": "en",
    "emailVerified": true
  }
}
```

---

# 12. Error Responses

| HTTP | Error Code |
|------|------------|
| 400 | BAD_REQUEST |
| 401 | UNAUTHORIZED |
| 403 | FORBIDDEN |
| 404 | PROFILE_NOT_FOUND |
| 413 | FILE_TOO_LARGE |
| 415 | UNSUPPORTED_MEDIA_TYPE |
| 422 | VALIDATION_ERROR |
| 500 | INTERNAL_SERVER_ERROR |

Responses follow `errors.md`.

---

# 13. Business Rules

- Users may modify only their own profile.
- Email changes are not supported in Version 1.
- Account status cannot be changed by users.
- Avatar replacement removes the previous avatar.
- Profile updates are logged for audit purposes.

---

# 14. Design Principles

- User ownership enforcement
- Secure profile updates
- Strong validation
- Consistent response format
- Minimal editable fields
- Audit-friendly operations

---

# References

- api_overview.md
- authentication.md
- errors.md
- ../development/features/profile.md

---

> **API Principle:** The Profile API gives users control over their personal preferences while protecting identity-related and security-sensitive information. Only user-editable fields may be modified, and every update is validated and auditable.