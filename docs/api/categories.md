---
title: Categories API

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
  - ../development/features/categories.md
---

# Categories API

> This document defines every endpoint related to transaction categories in Zentra, including category management, system categories, custom categories, and category retrieval.

---

# Table of Contents

1. Purpose
2. Authentication
3. Endpoints
4. Category Model
5. Get Categories
6. Get Category
7. Create Category
8. Update Category
9. Delete Category
10. Query Parameters
11. Validation Rules
12. Response Examples
13. Error Responses
14. Business Rules
15. Design Principles

---

# 1. Purpose

The Categories API manages transaction categories.

Categories are used by:

- Transactions
- Budgets
- Analytics
- Dashboard
- AI Insights

Version 1 supports:

- System Categories
- User Categories

---

# 2. Authentication

All endpoints require authentication.

```
Authorization: Bearer <access_token>
```

Users can manage only their own custom categories.

---

# 3. Endpoints

| Method | Endpoint | Description |
|---------|----------|-------------|
| GET | /categories | List categories |
| GET | /categories/{id} | Get category |
| POST | /categories | Create category |
| PATCH | /categories/{id} | Update category |
| DELETE | /categories/{id} | Delete category |

---

# 4. Category Model

A category contains:

- Name
- Type
- Icon
- Color
- System Flag
- Display Order

Category Types:

- INCOME
- EXPENSE

---

# 5. Get Categories

## Endpoint

```http
GET /api/v1/categories
```

Optional filters

```http
GET /categories?type=EXPENSE
```

```http
GET /categories?system=true
```

Response

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Food",
      "type": "EXPENSE",
      "icon": "restaurant",
      "color": "#EF4444",
      "system": true
    }
  ]
}
```

---

# 6. Get Category

## Endpoint

```http
GET /api/v1/categories/{id}
```

Returns the complete category details.

---

# 7. Create Category

## Endpoint

```http
POST /api/v1/categories
```

Request

```json
{
  "name": "Gym",
  "type": "EXPENSE",
  "icon": "fitness_center",
  "color": "#3B82F6"
}
```

Response

```http
201 Created
```

```json
{
  "success": true,
  "message": "Category created successfully.",
  "data": {
    "id": "uuid"
  }
}
```

---

# 8. Update Category

## Endpoint

```http
PATCH /api/v1/categories/{id}
```

Example

```json
{
  "name": "Fitness",
  "color": "#2563EB"
}
```

Only supplied fields are updated.

---

# 9. Delete Category

## Endpoint

```http
DELETE /api/v1/categories/{id}
```

Categories use soft delete.

Response

```json
{
  "success": true,
  "message": "Category deleted successfully."
}
```

---

# 10. Query Parameters

Supported filters

| Parameter | Description |
|------------|-------------|
| type | INCOME / EXPENSE |
| system | true / false |
| search | Category name |
| sort | Sort field |
| order | asc / desc |

Example

```http
GET /categories?type=EXPENSE&search=food
```

---

# 11. Validation Rules

Validation includes:

- Name is required.
- Name must be unique per user and type.
- Type must be INCOME or EXPENSE.
- Icon must be supported.
- Color must be a valid HEX code.

Validation failures return HTTP 422.

---

# 12. Response Examples

Single category

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Food",
    "type": "EXPENSE",
    "icon": "restaurant",
    "color": "#EF4444",
    "system": true
  }
}
```

Collection

```json
{
  "success": true,
  "data": []
}
```

---

# 13. Error Responses

| HTTP | Error Code |
|------|------------|
| 400 | BAD_REQUEST |
| 401 | UNAUTHORIZED |
| 403 | FORBIDDEN |
| 404 | CATEGORY_NOT_FOUND |
| 409 | CATEGORY_ALREADY_EXISTS |
| 422 | VALIDATION_ERROR |
| 500 | INTERNAL_SERVER_ERROR |

All responses follow `errors.md`.

---

# 14. Business Rules

- System categories cannot be modified.
- System categories cannot be deleted.
- Users may create unlimited custom categories.
- Users can update only their own categories.
- Categories referenced by active transactions cannot be permanently deleted.
- Soft-deleted categories are excluded from standard queries.

---

# 15. Design Principles

- RESTful resource design
- Soft delete support
- User ownership enforcement
- Immutable system categories
- Consistent response format
- Strong validation

---

# References

- api_overview.md
- authentication.md
- pagination.md
- errors.md
- ../development/features/categories.md

---

> **API Principle:** Categories provide the organizational foundation for financial data in Zentra. The API ensures that system categories remain protected while allowing users to create and manage personalized categories without compromising data integrity.