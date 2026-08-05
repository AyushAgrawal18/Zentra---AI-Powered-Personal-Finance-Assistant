# Payments API
---
title: Payments API

module: api

version: 1.0.0

status: Locked

priority: Critical

owner: Backend Team

related_docs:
  - api_overview.md
  - authentication.md
  - errors.md
  - pagination.md
  - ../development/features/payments.md
  - ../architecture/payment_architecture.md
---

# Payments API

> This document defines every endpoint related to UPI payment initiation, payment intents, reconciliation, and payment history in Zentra.

---

# Table of Contents

1. Purpose
2. Authentication
3. Payment Flow
4. Endpoints
5. Payment Intent Model
6. Initiate Payment
7. Payment History
8. Payment Details
9. Payment Reconciliation
10. Cancel Payment Intent
11. Query Parameters
12. Validation Rules
13. Response Examples
14. Error Responses
15. Business Rules
16. Security
17. Design Principles

---

# 1. Purpose

The Payments API enables users to initiate UPI payments directly from Zentra.

Version 1 supports:

- Payment Intent Creation
- UPI Deep Link Generation
- Payment History
- Payment Reconciliation
- Payment Status Tracking

Version 1 **does not process payments**.

Payments always occur in external UPI applications.

---

# 2. Authentication

All payment endpoints require authentication.

```
Authorization: Bearer <access_token>
```

Users may access only their own payment intents.

---

# 3. Payment Flow

```
User

↓

Create Payment Intent

↓

Generate UPI Deep Link

↓

Launch UPI App

↓

User Completes Payment

↓

Return to Zentra

↓

Payment Reconciliation

↓

Create Transaction

↓

Update Dashboard
```

---

# 4. Endpoints

| Method | Endpoint | Description |
|---------|----------|-------------|
| POST | /payments/initiate | Create payment intent |
| GET | /payments | Payment history |
| GET | /payments/{id} | Payment details |
| POST | /payments/{id}/reconcile | Reconcile payment |
| DELETE | /payments/{id} | Cancel payment intent |

---

# 5. Payment Intent Model

A payment intent contains:

- Merchant Name
- UPI ID
- Amount
- Currency
- Description
- Status
- Deep Link
- Created Time
- Completed Time

Possible status values:

- PENDING
- SUCCESS
- FAILED
- CANCELLED
- EXPIRED

---

# 6. Initiate Payment

## Endpoint

```http
POST /api/v1/payments/initiate
```

### Request

```json
{
  "merchantName": "ABC Supermarket",
  "upiId": "merchant@upi",
  "amount": 1200,
  "description": "Monthly groceries"
}
```

### Success

```http
201 Created
```

```json
{
  "success": true,
  "data": {
    "paymentId": "uuid",
    "status": "PENDING",
    "upiDeepLink": "upi://pay?...",
    "expiresAt": "2026-08-01T12:00:00Z"
  }
}
```

The frontend launches the returned UPI Deep Link using the device's supported UPI application.

---

# 7. Payment History

## Endpoint

```http
GET /api/v1/payments
```

Supports:

- Pagination
- Filtering
- Sorting

Example

```http
GET /payments?status=SUCCESS&page=1&limit=20
```

Returns the user's payment history.

---

# 8. Payment Details

## Endpoint

```http
GET /api/v1/payments/{id}
```

Returns complete payment information.

Example Response

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "merchantName": "ABC Supermarket",
    "amount": 1200,
    "status": "SUCCESS",
    "paymentReference": "UPI123456789",
    "createdAt": "2026-08-01T10:30:00Z"
  }
}
```

---

# 9. Payment Reconciliation

## Endpoint

```http
POST /api/v1/payments/{id}/reconcile
```

Purpose

Verify the payment outcome and update the payment intent.

Possible outcomes:

- SUCCESS
- FAILED
- CANCELLED

A successful reconciliation automatically creates a financial transaction.

---

# 10. Cancel Payment Intent

## Endpoint

```http
DELETE /api/v1/payments/{id}
```

Only pending payment intents may be cancelled.

Completed payments cannot be cancelled.

---

# 11. Query Parameters

| Parameter | Description |
|-----------|-------------|
| status | Payment status |
| from | Start date |
| to | End date |
| page | Page number |
| limit | Page size |
| sort | Sort field |
| order | asc / desc |

---

# 12. Validation Rules

Validation includes:

- Amount must be greater than zero.
- Merchant name is required.
- UPI ID must follow supported formats.
- Description length must not exceed configured limits.
- Payment intent must not be expired.
- Duplicate reconciliation requests are rejected.

Validation failures return HTTP 422.

---

# 13. Response Examples

Successful payment

```json
{
  "success": true,
  "data": {
    "paymentId": "uuid",
    "status": "SUCCESS",
    "transactionId": "uuid"
  }
}
```

Failed payment

```json
{
  "success": true,
  "data": {
    "paymentId": "uuid",
    "status": "FAILED"
  }
}
```

---

# 14. Error Responses

| HTTP | Error Code |
|------|------------|
| 400 | BAD_REQUEST |
| 401 | UNAUTHORIZED |
| 403 | FORBIDDEN |
| 404 | PAYMENT_NOT_FOUND |
| 409 | PAYMENT_ALREADY_RECONCILED |
| 422 | VALIDATION_ERROR |
| 500 | INTERNAL_SERVER_ERROR |

All responses follow `errors.md`.

---

# 15. Business Rules

- Zentra never stores UPI PINs.
- Zentra never processes payments.
- Payment intents expire automatically.
- Only successful reconciliations create transactions.
- Users may access only their own payment intents.
- Duplicate reconciliation requests are rejected.
- Every successful payment emits domain events.

---

# 16. Security

The Payments API enforces:

- JWT Authentication
- User ownership validation
- HTTPS-only communication
- Idempotency for reconciliation
- Rate limiting
- Secure audit logging

Sensitive payment credentials are never stored.

---

# 17. Design Principles

- RESTful resource design
- External payment processing
- Event-driven reconciliation
- Strong validation
- Secure by default
- Consistent response format
- User ownership enforcement

---

# References

- api_overview.md
- authentication.md
- errors.md
- pagination.md
- ../development/features/payments.md
- ../architecture/payment_architecture.md

---

> **API Principle:** Zentra facilitates payments by creating and tracking payment intents while delegating payment execution to trusted UPI applications. The API focuses on secure initiation, reliable reconciliation, and accurate financial record creation without ever handling sensitive payment credentials.