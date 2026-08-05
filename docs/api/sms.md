---
title: SMS Import API

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
  - ../development/features/sms_import.md
  - ../architecture/import_architecture.md
---

# SMS Import API

> This document defines every endpoint related to SMS-based transaction detection, suggestion generation, duplicate detection, and user confirmation.

---

# Table of Contents

1. Purpose
2. Authentication
3. SMS Processing Flow
4. Endpoints
5. SMS Upload
6. Suggested Transactions
7. Accept Suggestions
8. Reject Suggestions
9. Processing Status
10. Query Parameters
11. Validation Rules
12. Response Examples
13. Error Responses
14. Privacy
15. Business Rules
16. Design Principles

---

# 1. Purpose

The SMS Import API enables users to detect financial transactions from banking SMS messages.

Version 1 supports:

- SMS upload
- Transaction detection
- Duplicate detection
- User confirmation
- Import history

SMS messages are never converted into transactions automatically.

---

# 2. Authentication

All endpoints require authentication.

```
Authorization: Bearer <access_token>
```

SMS data belongs only to the authenticated user.

---

# 3. SMS Processing Flow

```
User Grants Permission

↓

Device Extracts SMS

↓

Upload SMS Batch

↓

Parse Messages

↓

Detect Transactions

↓

Duplicate Detection

↓

Generate Suggestions

↓

User Reviews

↓

Accept / Reject

↓

Create Transactions

↓

Update Dashboard
```

---

# 4. Endpoints

| Method | Endpoint | Description |
|---------|----------|-------------|
| POST | /imports/sms/upload | Upload SMS batch |
| GET | /imports/sms/{id}/suggestions | Suggested transactions |
| POST | /imports/sms/{id}/accept | Accept suggestions |
| POST | /imports/sms/{id}/reject | Reject suggestions |
| GET | /imports/sms | Import history |
| GET | /imports/sms/{id} | Import details |

---

# 5. SMS Upload

## Endpoint

```http
POST /api/v1/imports/sms/upload
```

### Request

```json
{
  "messages": [
    {
      "sender": "VK-HDFCBK",
      "body": "₹350 debited using UPI...",
      "receivedAt": "2026-08-01T10:20:00Z"
    }
  ]
}
```

### Success Response

```http
202 Accepted
```

```json
{
  "success": true,
  "data": {
    "importId": "uuid",
    "status": "PROCESSING"
  }
}
```

---

# 6. Suggested Transactions

## Endpoint

```http
GET /api/v1/imports/sms/{id}/suggestions
```

Returns detected transactions.

Example

```json
{
  "success": true,
  "data": [
    {
      "suggestionId": "uuid",
      "merchantName": "Starbucks",
      "amount": 350,
      "transactionType": "EXPENSE",
      "paymentMethod": "UPI",
      "confidence": 96
    }
  ]
}
```

---

# 7. Accept Suggestions

## Endpoint

```http
POST /api/v1/imports/sms/{id}/accept
```

Example

```json
{
  "suggestionIds": [
    "uuid1",
    "uuid2"
  ]
}
```

Accepted suggestions become transactions.

---

# 8. Reject Suggestions

## Endpoint

```http
POST /api/v1/imports/sms/{id}/reject
```

Rejected suggestions remain in history but are never imported.

---

# 9. Processing Status

## Endpoint

```http
GET /api/v1/imports/sms/{id}
```

Returns:

- Processing status
- Messages scanned
- Suggestions generated
- Accepted
- Rejected
- Duplicate count

Possible status values:

- PROCESSING
- COMPLETED
- FAILED

---

# 10. Query Parameters

| Parameter | Description |
|-----------|-------------|
| page | Page number |
| limit | Page size |
| status | Processing status |
| from | Start date |
| to | End date |

---

# 11. Validation Rules

Validation includes:

- SMS batch must not be empty.
- Each message requires sender, body, and timestamp.
- Duplicate SMS uploads are ignored.
- Unsupported formats are skipped.
- Invalid timestamps are rejected.

Validation failures return HTTP 422.

---

# 12. Response Examples

Import Summary

```json
{
  "success": true,
  "data": {
    "messagesScanned": 220,
    "transactionsDetected": 34,
    "duplicates": 5,
    "accepted": 20,
    "rejected": 9
  }
}
```

---

# 13. Error Responses

| HTTP | Error Code |
|------|------------|
| 400 | INVALID_SMS_DATA |
| 401 | UNAUTHORIZED |
| 403 | FORBIDDEN |
| 404 | IMPORT_NOT_FOUND |
| 409 | IMPORT_ALREADY_PROCESSED |
| 422 | VALIDATION_ERROR |
| 500 | INTERNAL_SERVER_ERROR |

All responses follow `errors.md`.

---

# 14. Privacy

Version 1 privacy rules:

- SMS messages are processed only after explicit user consent.
- Only messages submitted by the user are processed.
- Non-financial SMS messages are ignored.
- SMS content is never shared with third parties.
- Sensitive data is masked in logs.

---

# 15. Business Rules

- Transactions are never created automatically.
- Users decide which suggestions to import.
- Duplicate detection occurs before suggestions are shown.
- Accepted suggestions create normal transactions.
- Successful imports update Dashboard, Budgets, Analytics, Goals, and AI Insights.
- Users may access only their own SMS imports.

---

# 16. Design Principles

- Privacy-first
- User-controlled imports
- Non-destructive processing
- Strong validation
- Accurate duplicate detection
- Event-driven updates
- Consistent response format
- User ownership enforcement

---

# References

- api_overview.md
- authentication.md
- errors.md
- pagination.md
- ../development/features/sms_import.md
- ../architecture/import_architecture.md

---

> **API Principle:** The SMS Import API assists users by identifying potential financial transactions from banking messages while ensuring that users remain in full control. No SMS-derived transaction is added without explicit user approval, preserving both privacy and data accuracy.