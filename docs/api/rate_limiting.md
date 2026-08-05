---
title: API Rate Limiting

module: api

version: 1.0.0

status: Locked

priority: Critical

owner: Backend Team

related_docs:
  - api_overview.md
  - authentication.md
  - errors.md
  - versioning.md
  - ../security/security.md
---

# API Rate Limiting

> This document defines the rate limiting strategy used to protect Zentra's APIs from abuse, brute-force attacks, excessive usage, and accidental overload.

---

# Table of Contents

1. Purpose
2. Design Goals
3. Rate Limiting Strategy
4. Anonymous Endpoints
5. Authenticated Endpoints
6. AI Endpoints
7. Import Endpoints
8. Payment Endpoints
9. Rate Limit Headers
10. Rate Limit Response
11. Retry Strategy
12. Temporary Blocking
13. Monitoring
14. Design Principles
15. Locked Decisions
16. References

---

# 1. Purpose

Rate limiting protects Zentra against:

- Abuse
- Brute-force attacks
- API flooding
- Excessive AI usage
- Resource exhaustion

Every public API must follow these limits.

---

# 2. Design Goals

The rate limiting strategy should provide:

- Fair usage
- Stable performance
- Abuse prevention
- Predictable behavior
- Easy client implementation

---

# 3. Rate Limiting Strategy

Version 1 uses:

- IP-based limiting for anonymous users
- User ID-based limiting for authenticated users
- Endpoint-specific limits
- Sliding window algorithm

Limits may vary by endpoint category.

---

# 4. Anonymous Endpoints

| Endpoint | Limit |
|----------|-------|
| Register | 5 requests / hour |
| Login | 10 requests / 15 minutes |
| Forgot Password | 5 requests / hour |
| Refresh Token | 30 requests / hour |

Exceeding the limit returns HTTP 429.

---

# 5. Authenticated Endpoints

| Endpoint Type | Limit |
|--------------|-------|
| Read APIs | 300 requests / minute |
| Write APIs | 100 requests / minute |
| Search APIs | 60 requests / minute |

Examples:

- Dashboard
- Transactions
- Categories
- Goals
- Budgets

---

# 6. AI Endpoints

AI requests consume significantly more resources.

| Endpoint | Limit |
|----------|-------|
| AI Chat | 30 requests / hour |
| AI Insights | 60 requests / hour |

Future premium plans may offer higher limits.

---

# 7. Import Endpoints

| Endpoint | Limit |
|----------|-------|
| CSV Import | 10 uploads / hour |
| SMS Scan | 20 scans / hour |

These limits help protect backend processing resources.

---

# 8. Payment Endpoints

| Endpoint | Limit |
|----------|-------|
| Payment Intent | 30 requests / hour |
| Payment Reconciliation | 60 requests / hour |

Duplicate payment reconciliation requests should also be rejected through idempotency checks.

---

# 9. Rate Limit Headers

Successful responses may include:

```http
X-RateLimit-Limit: 100

X-RateLimit-Remaining: 76

X-RateLimit-Reset: 1722501000
```

Clients should use these headers to manage request frequency.

---

# 10. Rate Limit Response

When a limit is exceeded:

HTTP Status

```
429 Too Many Requests
```

Response

```json
{
  "success": false,
  "message": "Rate limit exceeded. Please try again later.",
  "error": {
    "code": "RATE_LIMIT_EXCEEDED"
  },
  "retryAfter": 120,
  "timestamp": "2026-08-01T10:30:00Z"
}
```

`retryAfter` specifies the number of seconds before another request should be attempted.

---

# 11. Retry Strategy

Clients should:

- Respect the `Retry-After` header.
- Retry only after the specified interval.
- Use exponential backoff for repeated failures.
- Avoid automatic retry loops for write operations.

---

# 12. Temporary Blocking

Repeated abuse may result in temporary restrictions.

Triggers may include:

- Excessive authentication failures
- Repeated rate limit violations
- Automated scanning behavior
- Suspicious API usage

Temporary blocks should expire automatically.

---

# 13. Monitoring

The backend should monitor:

- Rate limit violations
- Authentication failures
- AI request frequency
- Import frequency
- Payment endpoint usage

Metrics should be used to adjust limits as usage patterns evolve.

---

# 14. Design Principles

- Endpoint-specific limits
- Fair resource allocation
- Abuse prevention
- Predictable responses
- Standard HTTP 429 handling
- Client-friendly retry guidance

---

# 15. Locked Decisions

Version 1 decisions:

- Sliding window rate limiting
- IP-based limits for anonymous users
- User-based limits for authenticated users
- Endpoint-specific policies
- Standard HTTP 429 responses

Changes require updating this document.

---

# 16. References

- api_overview.md
- authentication.md
- errors.md
- versioning.md
- ../security/security.md

---

> **API Principle:** Rate limiting protects both users and infrastructure by ensuring fair resource usage. Every limit should balance usability with security while providing clear feedback and predictable recovery behavior.