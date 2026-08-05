---
title: Authentication API

module: api

version: 1.0.0

status: Locked

priority: Critical

owner: Backend Team

related_docs:
  - api_overview.md
  - versioning.md
  - errors.md
  - rate_limiting.md
  - ../architecture/backend_architecture.md
  - ../architecture/sequence-diagrams/authentication.md
---

# Authentication API

> This document defines every authentication endpoint exposed by Zentra, including registration, login, logout, refresh tokens, password reset, and session management.

---

# Table of Contents

1. Purpose
2. Authentication Flow
3. Endpoints
4. Register
5. Login
6. Refresh Token
7. Logout
8. Forgot Password
9. Reset Password
10. Authentication Rules
11. Validation Rules
12. Error Responses
13. Response Examples
14. Design Principles

---

# 1. Purpose

Authentication provides secure access to Zentra.

Responsibilities include:

- User registration
- User login
- JWT authentication
- Refresh token management
- Password reset
- Session termination

---

# 2. Authentication Flow

```
Register

↓

Login

↓

Access Token

↓

Protected APIs

↓

Access Token Expired

↓

Refresh Token

↓

New Access Token

↓

Logout
```

---

# 3. Endpoints

| Method | Endpoint | Authentication |
|---------|----------|----------------|
| POST | /auth/register | Public |
| POST | /auth/login | Public |
| POST | /auth/refresh | Public |
| POST | /auth/logout | Required |
| POST | /auth/forgot-password | Public |
| POST | /auth/reset-password | Public |
| GET | /auth/me | Required |

---

# 4. Register

## Endpoint

```http
POST /api/v1/auth/register
```

### Request

```json
{
  "fullName": "Ayush Kumar Agrawal",
  "email": "ayush@example.com",
  "password": "StrongPassword123!"
}
```

### Success Response

```http
201 Created
```

```json
{
  "success": true,
  "message": "Account created successfully.",
  "data": {
    "userId": "uuid"
  }
}
```

---

# 5. Login

## Endpoint

```http
POST /api/v1/auth/login
```

### Request

```json
{
  "email": "ayush@example.com",
  "password": "StrongPassword123!"
}
```

### Success Response

```json
{
  "success": true,
  "message": "Login successful.",
  "data": {
    "accessToken": "jwt-token",
    "refreshToken": "refresh-token",
    "expiresIn": 900,
    "user": {
      "id": "uuid",
      "fullName": "Ayush Kumar Agrawal",
      "email": "ayush@example.com"
    }
  }
}
```

---

# 6. Refresh Token

## Endpoint

```http
POST /api/v1/auth/refresh
```

### Request

```json
{
  "refreshToken": "refresh-token"
}
```

### Success Response

```json
{
  "success": true,
  "data": {
    "accessToken": "new-access-token",
    "expiresIn": 900
  }
}
```

---

# 7. Logout

## Endpoint

```http
POST /api/v1/auth/logout
```

### Headers

```http
Authorization: Bearer <access_token>
```

### Success Response

```json
{
  "success": true,
  "message": "Logged out successfully."
}
```

The refresh token is revoked and can no longer be used.

---

# 8. Forgot Password

## Endpoint

```http
POST /api/v1/auth/forgot-password
```

### Request

```json
{
  "email": "ayush@example.com"
}
```

### Success Response

```json
{
  "success": true,
  "message": "If an account exists, password reset instructions have been sent."
}
```

The same response should be returned even if the email is not registered to prevent account enumeration.

---

# 9. Reset Password

## Endpoint

```http
POST /api/v1/auth/reset-password
```

### Request

```json
{
  "token": "reset-token",
  "password": "NewStrongPassword123!"
}
```

### Success Response

```json
{
  "success": true,
  "message": "Password updated successfully."
}
```

---

# 10. Authentication Rules

- JWT Access Tokens authenticate API requests.
- Refresh Tokens issue new Access Tokens.
- Access Tokens are short-lived.
- Refresh Tokens can be revoked.
- Passwords are stored only as bcrypt hashes.
- HTTPS is mandatory.
- Every protected endpoint requires a valid JWT.

---

# 11. Validation Rules

## Registration

- Full name is required.
- Email must be valid.
- Email must be unique.
- Password must meet the password policy.

---

## Login

- Email is required.
- Password is required.

---

## Password Reset

- Reset token must be valid.
- Token must not be expired.
- Password must satisfy the password policy.

---

# 12. Error Responses

Possible errors:

| HTTP | Error Code | Description |
|------|------------|-------------|
| 400 | BAD_REQUEST | Invalid request |
| 401 | UNAUTHORIZED | Invalid credentials |
| 401 | TOKEN_EXPIRED | Access token expired |
| 403 | FORBIDDEN | Account disabled |
| 404 | USER_NOT_FOUND | User not found |
| 409 | EMAIL_ALREADY_EXISTS | Duplicate email |
| 422 | VALIDATION_ERROR | Validation failed |
| 429 | RATE_LIMIT_EXCEEDED | Too many requests |

All error responses follow the format defined in `errors.md`.

---

# 13. Response Examples

## Current User

```http
GET /api/v1/auth/me
```

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "fullName": "Ayush Kumar Agrawal",
    "email": "ayush@example.com",
    "currency": "INR",
    "timezone": "Asia/Kolkata"
  }
}
```

---

# 14. Design Principles

- Stateless authentication
- JWT-based authorization
- Refresh token rotation
- Secure password storage
- Consistent responses
- Strong input validation
- Protection against account enumeration
- HTTPS-only communication
- Rate-limited authentication endpoints

---

# References

- api_overview.md
- versioning.md
- errors.md
- rate_limiting.md
- ../architecture/backend_architecture.md
- ../architecture/sequence-diagrams/authentication.md

---

> **API Principle:** Authentication is the security gateway to Zentra. Every authentication endpoint should protect user identity, maintain stateless communication through JWTs, support secure session management with refresh tokens, and provide consistent, predictable responses while minimizing security risks.