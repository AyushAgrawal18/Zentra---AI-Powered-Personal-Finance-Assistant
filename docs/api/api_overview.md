---
title: API Overview

module: api

version: 1.0.0

status: Locked

priority: Critical

owner: Backend Team

related_docs:
  - authentication.md
  - errors.md
  - pagination.md
  - rate_limiting.md
  - versioning.md
  - ../architecture/backend_architecture.md
---

# API Overview

> This document defines the REST API standards, conventions, and communication contract used throughout Zentra.

---

# Table of Contents

1. Purpose
2. API Goals
3. API Style
4. Base URL
5. API Versioning
6. Authentication
7. Request Format
8. Response Format
9. HTTP Methods
10. Status Codes
11. Pagination
12. Filtering
13. Sorting
14. Idempotency
15. Error Handling
16. Rate Limiting
17. Security
18. API Lifecycle
19. Design Principles
20. Locked Decisions
21. References

---

# 1. Purpose

This document establishes the standards for every REST endpoint exposed by Zentra.

It defines:

- API conventions
- Request format
- Response format
- Authentication
- Versioning
- Error handling
- Security
- Pagination
- Filtering
- Sorting

Every API endpoint must follow these standards.

---

# 2. API Goals

The API should provide:

- Predictable behavior
- Consistent responses
- Strong validation
- Secure communication
- High performance
- Easy client integration
- Backward compatibility

---

# 3. API Style

Version 1 follows REST principles.

Characteristics:

- Resource-oriented URLs
- JSON requests
- JSON responses
- Stateless communication
- HTTPS only
- Standard HTTP status codes

GraphQL and gRPC are intentionally excluded from Version 1.

---

# 4. Base URL

Development

```
http://localhost:5000/api/v1
```

Production

```
https://api.zentra.app/api/v1
```

Every endpoint begins with:

```
/api/v1
```

---

# 5. API Versioning

Current version:

```
v1
```

Example

```
GET /api/v1/transactions
```

Major changes require a new API version.

Minor enhancements should remain backward compatible.

---

# 6. Authentication

Protected endpoints require:

```
Authorization: Bearer <access_token>
```

Public endpoints include:

- Login
- Register
- Forgot Password
- Refresh Token

Authentication details are defined in:

```
authentication.md
```

---

# 7. Request Format

Requests use JSON.

Example

```json
{
  "merchantName": "Starbucks",
  "amount": 350,
  "categoryId": "uuid"
}
```

Rules:

- UTF-8 encoding
- `Content-Type: application/json`
- Validate all request bodies
- Reject unknown fields where appropriate

---

# 8. Response Format

Successful responses follow:

```json
{
  "success": true,
  "message": "Transaction created successfully.",
  "data": {},
  "meta": {},
  "timestamp": "2026-08-01T10:30:00Z"
}
```

Error responses follow:

```json
{
  "success": false,
  "message": "Validation failed.",
  "errors": [],
  "timestamp": "2026-08-01T10:30:00Z"
}
```

Every endpoint should use the same response structure.

---

# 9. HTTP Methods

| Method | Purpose |
|---------|----------|
| GET | Retrieve resources |
| POST | Create resources |
| PUT | Replace resources |
| PATCH | Partially update resources |
| DELETE | Soft delete resources |

---

# 10. Status Codes

| Code | Meaning |
|------|----------|
| 200 | Success |
| 201 | Created |
| 204 | No Content |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 422 | Validation Error |
| 429 | Too Many Requests |
| 500 | Internal Server Error |

Only standard HTTP status codes should be used.

---

# 11. Pagination

List endpoints should support pagination.

Example

```
GET /transactions?page=1&limit=20
```

Response metadata:

```json
{
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 145,
    "totalPages": 8
  }
}
```

Pagination details are defined in:

```
pagination.md
```

---

# 12. Filtering

Example

```
GET /transactions?category=food&type=expense
```

Rules:

- Filters are optional.
- Filters are combinable.
- Invalid filters return validation errors.

---

# 13. Sorting

Example

```
GET /transactions?sort=transactionDate&order=desc
```

Allowed values:

```
asc
desc
```

Default sorting should be documented per endpoint.

---

# 14. Idempotency

GET requests are idempotent.

PUT requests should be idempotent.

POST requests creating external payment intents should support idempotency keys where appropriate.

Example

```
Idempotency-Key: <uuid>
```

---

# 15. Error Handling

Errors should include:

- HTTP status
- Error code
- Human-readable message
- Validation details (if applicable)

Internal implementation details must never be exposed.

---

# 16. Rate Limiting

Rate limiting applies to:

- Authentication
- AI Chat
- CSV Import
- SMS Import
- Payment APIs

Limits are defined in:

```
rate_limiting.md
```

---

# 17. Security

The API enforces:

- HTTPS only
- JWT Authentication
- Authorization
- Input validation
- Rate limiting
- Parameterized database queries
- CORS
- Secure headers

Every endpoint should follow the principle of least privilege.

---

# 18. API Lifecycle

```
Client Request

↓

Authentication

↓

Validation

↓

Controller

↓

Service

↓

Repository

↓

Database

↓

Response

↓

Client
```

Business logic belongs only in the Service layer.

---

# 19. Design Principles

- REST-first
- Stateless
- Secure by default
- Predictable responses
- Standardized errors
- Versioned APIs
- Backward compatibility
- Thin controllers
- Strong validation

---

# 20. Locked Decisions

Version 1 API decisions:

- REST API
- JSON payloads
- JWT Authentication
- Versioned endpoints
- Standard response format
- HTTPS only
- Stateless communication

Changes require updating this document.

---

# 21. References

- authentication.md
- pagination.md
- errors.md
- rate_limiting.md
- versioning.md
- ../architecture/backend_architecture.md

---

> **API Principle:** The Zentra REST API is the single communication layer between clients and backend services. Every endpoint must be secure, versioned, predictable, well-documented, and consistent with the standards defined in this document.