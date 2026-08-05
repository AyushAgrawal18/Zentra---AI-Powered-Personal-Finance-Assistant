---
title: Reports API

module: api

version: 1.0.0

status: Locked

priority: High

owner: Backend Team

related_docs:
  - api_overview.md
  - analytics.md
  - authentication.md
  - errors.md
  - ../development/features/reports.md
---

# Reports API

> This document defines every endpoint related to financial report generation, report history, exports, and downloadable report files.

---

# Table of Contents

1. Purpose
2. Authentication
3. Supported Reports
4. Endpoints
5. Report Model
6. Generate Report
7. Get Report
8. Download Report
9. Report History
10. Delete Report
11. Query Parameters
12. Validation Rules
13. Response Examples
14. Error Responses
15. Business Rules
16. Future Enhancements
17. Design Principles

---

# 1. Purpose

The Reports API enables users to generate downloadable summaries of their financial data.

Version 1 supports:

- Monthly Reports
- Yearly Reports
- CSV Export
- PDF Export
- Report History

Reports are generated from Analytics and Transactions.

---

# 2. Authentication

All report endpoints require authentication.

```
Authorization: Bearer <access_token>
```

Users may access only their own reports.

---

# 3. Supported Reports

Available report types:

- Monthly Summary
- Yearly Summary
- Category Spending
- Income vs Expense
- Cash Flow

Supported export formats:

- PDF
- CSV

---

# 4. Endpoints

| Method | Endpoint | Description |
|---------|----------|-------------|
| POST | /reports | Generate report |
| GET | /reports | Report history |
| GET | /reports/{id} | Report details |
| GET | /reports/{id}/download | Download report |
| DELETE | /reports/{id} | Delete report |

---

# 5. Report Model

A report contains:

- Report ID
- Report Type
- Format
- Status
- File Size
- Created At
- Expires At
- Download URL

Possible status values:

- PENDING
- PROCESSING
- COMPLETED
- FAILED
- EXPIRED

---

# 6. Generate Report

## Endpoint

```http
POST /api/v1/reports
```

### Request

```json
{
  "reportType": "MONTHLY_SUMMARY",
  "format": "PDF",
  "month": 8,
  "year": 2026
}
```

### Success Response

```http
202 Accepted
```

```json
{
  "success": true,
  "message": "Report generation started.",
  "data": {
    "reportId": "uuid",
    "status": "PROCESSING"
  }
}
```

Report generation may occur asynchronously.

---

# 7. Get Report

## Endpoint

```http
GET /api/v1/reports/{id}
```

Returns:

- Report metadata
- Current status
- Download availability

---

# 8. Download Report

## Endpoint

```http
GET /api/v1/reports/{id}/download
```

Downloads the generated report file.

Download is available only after the report reaches the **COMPLETED** state.

---

# 9. Report History

## Endpoint

```http
GET /api/v1/reports
```

Supports:

- Pagination
- Filtering
- Sorting

Example

```http
GET /reports?status=COMPLETED
```

---

# 10. Delete Report

## Endpoint

```http
DELETE /api/v1/reports/{id}
```

Deletes the generated report from the user's history.

Deleting a report does not modify financial data.

---

# 11. Query Parameters

| Parameter | Description |
|-----------|-------------|
| type | Report type |
| format | PDF / CSV |
| status | Generation status |
| page | Page number |
| limit | Page size |
| sort | Sort field |
| order | asc / desc |

---

# 12. Validation Rules

Validation includes:

- Report type must be supported.
- Export format must be supported.
- Month must be between 1 and 12.
- Year must be valid.
- Requested period must contain data.
- Duplicate generation requests may be reused if an identical report already exists.

Validation failures return HTTP 422.

---

# 13. Response Examples

Report Details

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "reportType": "MONTHLY_SUMMARY",
    "format": "PDF",
    "status": "COMPLETED",
    "downloadUrl": "/api/v1/reports/uuid/download",
    "createdAt": "2026-08-01T10:30:00Z"
  }
}
```

Report History

```json
{
  "success": true,
  "data": [],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 12
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
| 404 | REPORT_NOT_FOUND |
| 409 | REPORT_ALREADY_GENERATING |
| 422 | VALIDATION_ERROR |
| 500 | INTERNAL_SERVER_ERROR |

Responses follow `errors.md`.

---

# 15. Business Rules

- Users may access only their own reports.
- Reports are generated from immutable financial data.
- Generated reports do not update automatically after new transactions.
- Reports may expire after the configured retention period.
- Download links are available only while the report exists.
- Report generation should not block user requests.

---

# 16. Future Enhancements

Future versions may support:

- Scheduled reports
- Email delivery
- Excel exports
- Custom report templates
- Quarterly reports
- Tax summaries

---

# 17. Design Principles

- Asynchronous generation
- Immutable report snapshots
- Secure downloads
- Strong validation
- Consistent response format
- User ownership enforcement

---

# References

- api_overview.md
- analytics.md
- authentication.md
- errors.md
- ../development/features/reports.md

---

> **API Principle:** Reports provide users with portable snapshots of their financial data. Every generated report should represent an immutable view of the selected reporting period, remain securely accessible to its owner, and be generated without impacting the responsiveness of the core application.