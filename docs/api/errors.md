# 🌐 API Specification: Standard Error Responses & Codes
---
title: API Error Handling

module: api

version: 1.0.0

status: Locked

priority: Critical

owner: Backend Team

related_docs:
  - api_overview.md
  - authentication.md
  - pagination.md
  - rate_limiting.md
  - versioning.md
  - ../architecture/backend_architecture.md
---

# API Error Handling

> This document defines the standard error model used by every REST API endpoint in Zentra.

---

# Table of Contents

1. Purpose
2. Error Handling Goals
3. Error Response Format
4. Error Categories
5. Standard Error Codes
6. Validation Errors
7. Authentication Errors
8. Authorization Errors
9. Business Rule Errors
10. Resource Errors
11. Rate Limiting Errors
12. Server Errors
13. Correlation IDs
14. Logging Rules
15. Design Principles
16. Locked Decisions
17. References

---

# 1. Purpose

This document standardizes API error responses.

Every endpoint should return:

- Predictable errors
- Consistent structure
- Machine-readable error codes
- Human-readable messages
- Traceable requests

---

# 2. Error Handling Goals

The API should provide:

- Clear client feedback
- Consistent responses
- Secure error messages
- Easy debugging
- Reliable automation

Internal implementation details must never be exposed.

---

# 3. Error Response Format

Every failed request returns:

```json
{
  "success": false,
  "message": "Validation failed.",
  "error": {
    "code": "VALIDATION_ERROR",
    "details": []
  },
  "requestId": "req_8fd8d0d2",
  "timestamp": "2026-08-01T10:30:00Z"
}
```

### Fields

| Field | Description |
|--------|-------------|
| success | Always `false` |
| message | Human-readable summary |
| error.code | Stable application error code |
| error.details | Validation or business details |
| requestId | Correlation identifier |
| timestamp | UTC timestamp |

---

# 4. Error Categories

Errors are grouped into:

- Validation
- Authentication
- Authorization
- Business Rules
- Resources
- Rate Limiting
- Server Errors

Each category has standardized error codes.

---

# 5. Standard Error Codes

| HTTP | Error Code | Description |
|------|------------|-------------|
| 400 | BAD_REQUEST | Invalid request |
| 401 | UNAUTHORIZED | Authentication required |
| 403 | FORBIDDEN | Permission denied |
| 404 | NOT_FOUND | Resource not found |
| 409 | CONFLICT | Duplicate or conflicting resource |
| 422 | VALIDATION_ERROR | Request validation failed |
| 429 | RATE_LIMIT_EXCEEDED | Too many requests |
| 500 | INTERNAL_SERVER_ERROR | Unexpected server error |
| 503 | SERVICE_UNAVAILABLE | Temporary service outage |

Application error codes should remain stable across versions.

---

# 6. Validation Errors

Example:

```json
{
  "success": false,
  "message": "Validation failed.",
  "error": {
    "code": "VALIDATION_ERROR",
    "details": [
      {
        "field": "amount",
        "message": "Amount must be greater than zero."
      },
      {
        "field": "categoryId",
        "message": "Category is required."
      }
    ]
  }
}
```

Validation should return all detected errors where practical.

---

# 7. Authentication Errors

Examples:

- Missing JWT
- Invalid JWT
- Expired JWT
- Invalid Refresh Token

Response

```json
{
  "success": false,
  "message": "Authentication required.",
  "error": {
    "code": "UNAUTHORIZED"
  }
}
```

---

# 8. Authorization Errors

Examples:

- Accessing another user's transaction
- Admin-only endpoint
- Restricted operation

Response

```json
{
  "success": false,
  "message": "You do not have permission to perform this action.",
  "error": {
    "code": "FORBIDDEN"
  }
}
```

---

# 9. Business Rule Errors

Examples:

- Budget exceeded
- Duplicate transaction
- Goal already completed
- Payment already reconciled
- CSV already imported

Response

```json
{
  "success": false,
  "message": "Duplicate transaction detected.",
  "error": {
    "code": "DUPLICATE_TRANSACTION"
  }
}
```

Business rules should use domain-specific error codes.

---

# 10. Resource Errors

Examples:

- User not found
- Transaction not found
- Category not found

Response

```json
{
  "success": false,
  "message": "Transaction not found.",
  "error": {
    "code": "TRANSACTION_NOT_FOUND"
  }
}
```

---

# 11. Rate Limiting Errors

Example

```json
{
  "success": false,
  "message": "Too many requests. Please try again later.",
  "error": {
    "code": "RATE_LIMIT_EXCEEDED"
  }
}
```

Clients should retry after the specified delay.

---

# 12. Server Errors

Unexpected failures return:

```json
{
  "success": false,
  "message": "An unexpected error occurred.",
  "error": {
    "code": "INTERNAL_SERVER_ERROR"
  },
  "requestId": "req_8fd8d0d2"
}
```

Stack traces, SQL queries, and internal details must never be returned.

---

# 13. Correlation IDs

Every request should receive a unique request identifier.

Example

```
req_8fd8d0d2
```

The request ID should:

- Be included in logs
- Be returned in error responses
- Help trace production issues

---

# 14. Logging Rules

The backend should log:

- Request ID
- Error Code
- HTTP Status
- Endpoint
- Execution Time

Never log:

- Passwords
- JWTs
- Refresh Tokens
- OTPs
- UPI PINs
- Sensitive financial information

---

# 15. Design Principles

- Standard response format
- Stable error codes
- Human-readable messages
- Machine-readable codes
- Secure error responses
- Complete validation
- Traceable requests

---

# 16. Locked Decisions

Version 1 decisions:

- Unified error format
- Request correlation IDs
- Stable application error codes
- JSON responses only
- No stack traces in production

Changes require updating this document.

---

# 17. References

- api_overview.md
- authentication.md
- pagination.md
- rate_limiting.md
- versioning.md
- ../architecture/backend_architecture.md

---

> **API Principle:** Every API error in Zentra should be predictable, secure, and actionable. Clients receive consistent error structures, developers receive traceable request identifiers, and sensitive implementation details remain protected.