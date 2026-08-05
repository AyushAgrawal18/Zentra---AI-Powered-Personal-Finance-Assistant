# 🌐 API Specification: Pagination & Filtering
---
title: Pagination, Filtering & Sorting

module: api

version: 1.0.0

status: Locked

priority: Critical

owner: Backend Team

related_docs:
  - api_overview.md
  - errors.md
  - versioning.md
  - transactions.md
  - notifications.md
  - reports.md
---

# Pagination, Filtering & Sorting

> This document defines the standard conventions for paginating, filtering, searching, and sorting collection endpoints in Zentra.

---

# Table of Contents

1. Purpose
2. Design Goals
3. Supported Endpoints
4. Pagination
5. Filtering
6. Searching
7. Sorting
8. Response Metadata
9. Validation Rules
10. Performance Guidelines
11. Design Principles
12. Locked Decisions
13. References

---

# 1. Purpose

This document standardizes how collection endpoints return data.

It defines:

- Pagination
- Filtering
- Searching
- Sorting
- Response metadata

Every endpoint returning multiple resources must follow these rules.

---

# 2. Design Goals

The API should provide:

- Predictable pagination
- Consistent query parameters
- Efficient filtering
- Flexible sorting
- High performance
- Stable response format

---

# 3. Supported Endpoints

Examples include:

- GET /transactions
- GET /categories
- GET /budgets
- GET /goals
- GET /notifications
- GET /payment-intents
- GET /ai-insights

---

# 4. Pagination

Pagination uses query parameters.

Example

```http
GET /transactions?page=1&limit=20
```

### Parameters

| Parameter | Default | Minimum | Maximum |
|-----------|---------|---------|---------|
| page | 1 | 1 | - |
| limit | 20 | 1 | 100 |

Requests exceeding the maximum limit should return a validation error.

---

# 5. Filtering

Filtering narrows returned records.

Example

```http
GET /transactions?type=expense
```

Multiple filters

```http
GET /transactions?category=food&type=expense
```

Date range

```http
GET /transactions?from=2026-01-01&to=2026-01-31
```

Amount range

```http
GET /transactions?minAmount=100&maxAmount=5000
```

Only documented filters should be accepted.

---

# 6. Searching

Search uses the `search` query parameter.

Example

```http
GET /transactions?search=starbucks
```

Search may include:

- Merchant name
- Notes
- Category name (where supported)

Search should be case-insensitive.

---

# 7. Sorting

Sorting uses:

```text
sort
order
```

Example

```http
GET /transactions?sort=transactionDate&order=desc
```

Supported values

Order

```
asc
desc
```

Example sortable fields

- transactionDate
- amount
- createdAt
- merchantName

Endpoints should document supported sort fields.

Unknown sort fields should return a validation error.

---

# 8. Response Metadata

Collection responses include metadata.

Example

```json
{
  "success": true,
  "data": [],
  "meta": {
    "page": 2,
    "limit": 20,
    "total": 145,
    "totalPages": 8,
    "hasPrevious": true,
    "hasNext": true
  },
  "timestamp": "2026-08-01T10:30:00Z"
}
```

### Metadata Fields

| Field | Description |
|--------|-------------|
| page | Current page |
| limit | Records per page |
| total | Total matching records |
| totalPages | Number of available pages |
| hasPrevious | Previous page exists |
| hasNext | Next page exists |

---

# 9. Validation Rules

Requests should be rejected when:

- `page < 1`
- `limit < 1`
- `limit > 100`
- Invalid date format
- Invalid filter value
- Unsupported sort field
- Invalid sort order

Validation errors follow the standard error format defined in `errors.md`.

---

# 10. Performance Guidelines

Collection endpoints should:

- Use indexed columns for filtering.
- Apply pagination before returning results.
- Avoid full table scans.
- Select only required columns.
- Use stable ordering.

Large datasets must never be returned without pagination.

---

# 11. Design Principles

- Consistent query parameters
- Stable response metadata
- Predictable ordering
- Efficient database queries
- Validation before execution
- Backward-compatible behavior

---

# 12. Locked Decisions

Version 1 decisions:

- Page-based pagination
- Maximum page size: 100
- Query parameter filtering
- Query parameter searching
- Query parameter sorting
- Standard metadata response

Changes require updating this document.

---

# 13. References

- api_overview.md
- errors.md
- versioning.md
- transactions.md
- notifications.md

---

> **API Principle:** Every collection endpoint in Zentra should behave consistently. Clients should be able to paginate, filter, search, and sort resources using a standardized query interface, while the backend ensures efficient execution and predictable responses.