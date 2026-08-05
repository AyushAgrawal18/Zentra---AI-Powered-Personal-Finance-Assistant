---
title: Transactions API

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
  - ../development/features/transactions.md
  - ../architecture/sequence-diagrams/transaction_flow.md
---

# Transactions API

> This document defines every endpoint related to financial transactions in Zentra, including CRUD operations, searching, filtering, pagination, reconciliation, and bulk actions.

---

# Table of Contents

1. Purpose
2. Authentication
3. Endpoints
4. Transaction Model
5. Create Transaction
6. Get Transactions
7. Get Transaction
8. Update Transaction
9. Delete Transaction
10. Bulk Operations
11. Query Parameters
12. Validation Rules
13. Response Examples
14. Error Responses
15. Business Rules
16. Design Principles

---

# 1. Purpose

The Transactions API manages every financial transaction in Zentra.

Supported operations:

- Create
- Read
- Update
- Delete (Soft Delete)
- Search
- Filter
- Sort
- Pagination
- Bulk Delete
- Bulk Category Update

Transactions are the primary financial records used by every other module.

---

# 2. Authentication

All transaction endpoints require authentication.

```
Authorization: Bearer <access_token>
```

Every transaction belongs to the authenticated user.

---

# 3. Endpoints

| Method | Endpoint | Description |
|---------|----------|-------------|
| GET | /transactions | List transactions |
| POST | /transactions | Create transaction |
| GET | /transactions/{id} | Get transaction |
| PATCH | /transactions/{id} | Update transaction |
| DELETE | /transactions/{id} | Soft delete transaction |
| POST | /transactions/bulk-delete | Bulk delete |
| PATCH | /transactions/bulk-category | Bulk category update |

---

# 4. Transaction Model

A transaction contains:

- Amount
- Type
- Category
- Merchant
- Payment Method
- Source
- Notes
- Transaction Date

The backend automatically associates the transaction with the authenticated user.

---

# 5. Create Transaction

## Endpoint

```http
POST /api/v1/transactions
```

### Request

```json
{
  "amount": 350,
  "transactionType": "EXPENSE",
  "categoryId": "uuid",
  "merchantName": "Starbucks",
  "paymentMethod": "UPI",
  "transactionDate": "2026-08-01",
  "notes": "Coffee"
}
```

### Success

```http
201 Created
```

```json
{
  "success": true,
  "message": "Transaction created successfully.",
  "data": {
    "id": "uuid"
  }
}
```

Creating a transaction automatically triggers:

- Dashboard refresh
- Budget update
- Analytics update
- AI Insight generation
- Notification evaluation

---

# 6. Get Transactions

## Endpoint

```http
GET /api/v1/transactions
```

Supports:

- Pagination
- Filtering
- Sorting
- Searching

Example

```http
GET /transactions?page=1&limit=20
```

Example

```http
GET /transactions?type=EXPENSE&category=food
```

Example

```http
GET /transactions?search=amazon
```

---

# 7. Get Transaction

## Endpoint

```http
GET /api/v1/transactions/{id}
```

Returns the complete transaction.

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "amount": 350,
    "merchantName": "Starbucks",
    "transactionType": "EXPENSE",
    "paymentMethod": "UPI",
    "category": {},
    "notes": "Coffee"
  }
}
```

---

# 8. Update Transaction

## Endpoint

```http
PATCH /api/v1/transactions/{id}
```

Only provided fields are updated.

Example

```json
{
  "categoryId": "uuid",
  "notes": "Lunch Meeting"
}
```

Updating a transaction automatically recalculates:

- Dashboard
- Budget
- Analytics
- AI Insights

---

# 9. Delete Transaction

## Endpoint

```http
DELETE /api/v1/transactions/{id}
```

Transactions are soft deleted.

Example Response

```json
{
  "success": true,
  "message": "Transaction deleted successfully."
}
```

Deleted transactions are excluded from standard queries.

---

# 10. Bulk Operations

## Bulk Delete

```http
POST /transactions/bulk-delete
```

Example

```json
{
  "transactionIds": [
    "uuid1",
    "uuid2",
    "uuid3"
  ]
}
```

---

## Bulk Category Update

```http
PATCH /transactions/bulk-category
```

Example

```json
{
  "transactionIds": [
    "uuid1",
    "uuid2"
  ],
  "categoryId": "uuid"
}
```

Each successful bulk operation emits the appropriate domain events.

---

# 11. Query Parameters

Supported parameters

| Parameter | Description |
|------------|-------------|
| page | Page number |
| limit | Page size |
| search | Merchant or notes |
| category | Category ID |
| type | Income or Expense |
| paymentMethod | UPI, Cash, Card |
| source | Manual, CSV, SMS, Payment |
| from | Start date |
| to | End date |
| minAmount | Minimum amount |
| maxAmount | Maximum amount |
| sort | Sort field |
| order | asc or desc |

Example

```http
GET /transactions?type=EXPENSE&paymentMethod=UPI&from=2026-08-01&to=2026-08-31&page=1&limit=20
```

---

# 12. Validation Rules

Validation includes:

- Amount must be greater than zero.
- Category must exist.
- Transaction type is required.
- Transaction date is required.
- Payment method must be supported.
- Merchant name length must not exceed configured limits.
- Future transaction dates may be restricted based on business rules.

Validation failures return HTTP 422.

---

# 13. Response Examples

Collection response

```json
{
  "success": true,
  "data": [],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 143,
    "totalPages": 8
  }
}
```

Single resource response

```json
{
  "success": true,
  "data": {}
}
```

---

# 14. Error Responses

Possible errors

| HTTP | Error Code |
|------|------------|
| 400 | BAD_REQUEST |
| 401 | UNAUTHORIZED |
| 403 | FORBIDDEN |
| 404 | TRANSACTION_NOT_FOUND |
| 409 | DUPLICATE_TRANSACTION |
| 422 | VALIDATION_ERROR |
| 500 | INTERNAL_SERVER_ERROR |

Responses follow `errors.md`.

---

# 15. Business Rules

- Users may access only their own transactions.
- Soft-deleted transactions are hidden from normal queries.
- Every transaction emits domain events after a successful commit.
- Duplicate detection is performed for imported records.
- Transactions are immutable during failed database operations.
- Financial calculations are performed by services, not controllers.

---

# 16. Design Principles

- RESTful resource design
- Soft delete support
- Standardized responses
- Strong validation
- Event-driven updates
- Repository pattern
- Pagination by default
- Secure ownership enforcement

---

# References

- api_overview.md
- authentication.md
- pagination.md
- errors.md
- ../development/features/transactions.md
- ../architecture/sequence-diagrams/transaction_flow.md

---

> **API Principle:** Transactions are the core financial entities in Zentra. Every operation must preserve data integrity, enforce user ownership, emit appropriate domain events, and provide consistent, predictable behavior across all clients.