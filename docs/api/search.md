---
title: Search API

module: api

version: 1.0.0

status: Locked

priority: High

owner: Backend Team

related_docs:
  - api_overview.md
  - pagination.md
  - authentication.md
  - errors.md
  - transactions.md
---

# Search API

> This document defines the unified search endpoints used throughout Zentra for searching financial data across supported modules.

---

# Table of Contents

1. Purpose
2. Authentication
3. Search Scope
4. Endpoints
5. Search Request
6. Search Response
7. Query Parameters
8. Search Filters
9. Search Ranking
10. Validation Rules
11. Response Examples
12. Error Responses
13. Business Rules
14. Design Principles

---

# 1. Purpose

The Search API provides a consistent way to search financial information across Zentra.

Version 1 supports searching:

- Transactions
- Categories
- Budgets
- Goals
- Payments
- Reports

Future versions may include AI-assisted search.

---

# 2. Authentication

All search endpoints require authentication.

```
Authorization: Bearer <access_token>
```

Users may search only their own data.

---

# 3. Search Scope

Supported modules:

- Transactions
- Categories
- Budgets
- Goals
- Payments
- Reports

Search does not include deleted resources.

---

# 4. Endpoints

| Method | Endpoint | Description |
|---------|----------|-------------|
| GET | /search | Global search |
| GET | /search/transactions | Search transactions |
| GET | /search/categories | Search categories |
| GET | /search/goals | Search goals |
| GET | /search/payments | Search payments |
| GET | /search/reports | Search reports |

---

# 5. Search Request

Example

```http
GET /api/v1/search?q=starbucks
```

Search is case-insensitive.

---

# 6. Search Response

Example

```json
{
  "success": true,
  "data": {
    "transactions": [],
    "categories": [],
    "budgets": [],
    "goals": [],
    "payments": [],
    "reports": []
  }
}
```

Each collection contains matching resources.

---

# 7. Query Parameters

| Parameter | Description |
|-----------|-------------|
| q | Search keyword |
| module | Limit search scope |
| page | Page number |
| limit | Page size |
| sort | Sort field |
| order | asc / desc |

Example

```http
GET /search?q=laptop&module=goals
```

---

# 8. Search Filters

Supported filters vary by module.

Examples:

Transactions

- Date Range
- Amount Range
- Category
- Payment Method
- Transaction Type

Goals

- Status

Reports

- Type
- Format

Payments

- Status

---

# 9. Search Ranking

Results should prioritize:

1. Exact matches
2. Prefix matches
3. Partial matches

Sorting should remain deterministic.

Future versions may introduce relevance scoring.

---

# 10. Validation Rules

Validation includes:

- Search query is required.
- Search query must not exceed configured limits.
- Module must be supported.
- Pagination parameters must be valid.

Validation failures return HTTP 422.

---

# 11. Response Examples

Example

```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": "uuid",
        "merchantName": "Starbucks",
        "amount": 350
      }
    ]
  }
}
```

No results

```json
{
  "success": true,
  "data": {}
}
```

---

# 12. Error Responses

| HTTP | Error Code |
|------|------------|
| 400 | BAD_REQUEST |
| 401 | UNAUTHORIZED |
| 403 | FORBIDDEN |
| 422 | VALIDATION_ERROR |
| 500 | INTERNAL_SERVER_ERROR |

Responses follow `errors.md`.

---

# 13. Business Rules

- Users may search only their own data.
- Soft-deleted resources are excluded.
- Search results respect module permissions.
- Search does not modify data.
- Large result sets must use pagination.

---

# 14. Design Principles

- Unified search interface
- Fast response times
- Consistent filtering
- Secure ownership enforcement
- Strong validation
- Predictable ordering
- Standard response format

---

# References

- api_overview.md
- authentication.md
- pagination.md
- errors.md
- transactions.md

---

> **API Principle:** The Search API provides a unified and secure way to discover financial information across Zentra. Every search request should be fast, consistent, permission-aware, and return predictable results without exposing unauthorized data.