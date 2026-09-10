---
title: CSV Import API

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
  - ../development/features/csv_import.md
  - ../architecture/import_architecture.md
---

# CSV Import API

> This document defines every endpoint related to importing bank statements into Zentra using CSV files, including upload, validation, preview, duplicate detection, import execution, history, and rollback.

---

# Table of Contents

1. Purpose
2. Authentication
3. Import Flow
4. Endpoints
5. Supported Formats
6. Upload CSV
7. Preview Import
8. Execute Import
9. Import History
10. Import Details
11. Cancel Import
12. Validation Rules
13. Duplicate Detection
14. Response Examples
15. Error Responses
16. Business Rules
17. Design Principles

---

# 1. Purpose

The CSV Import API enables users to import financial transactions from bank statements.

Version 1 supports:

- CSV Upload
- File Validation
- Data Preview
- Duplicate Detection
- Transaction Import
- Import History

Importing transactions never modifies existing transactions automatically.

---

# 2. Authentication

All endpoints require authentication.

```
Authorization: Bearer <access_token>
```

Users may access only their own imports.

---

# 3. Import Flow

```
Upload CSV

↓

Validate File

↓

Parse Records

↓

Preview

↓

Duplicate Detection

↓

User Confirms

↓

Import Transactions

↓

Update Dashboard

↓

Generate Analytics

↓

Complete
```

---

# 4. Endpoints

| Method | Endpoint                  | Description           |
| ------ | ------------------------- | --------------------- |
| POST   | /imports/csv/upload       | Upload CSV            |
| GET    | /imports/csv/{id}/preview | Preview parsed data   |
| POST   | /imports/csv/{id}/confirm | Execute import        |
| GET    | /imports/csv              | Import history        |
| GET    | /imports/csv/{id}         | Import details        |
| DELETE | /imports/csv/{id}         | Cancel pending import |

---

# 5. Supported Formats

Version 1 supports:

- Standard CSV
- UTF-8 Encoding
- Configured bank statement formats

Future versions may support:

- XLSX
- PDF
- OFX
- QIF

---

# 6. Upload CSV

## Endpoint

```http
POST /api/v1/imports/csv/upload
```

Content Type

```http
multipart/form-data
```

Form Field

```
file
```

### Success Response

```http
201 Created
```

```json
{
  "success": true,
  "data": {
    "importId": "uuid",
    "status": "UPLOADED"
  }
}
```

---

# 7. Preview Import

## Endpoint

```http
GET /api/v1/imports/csv/{id}/preview
```

Returns:

- Parsed records
- Validation errors
- Duplicate records
- Summary statistics

Example

```json
{
  "success": true,
  "data": {
    "totalRecords": 150,
    "validRecords": 145,
    "duplicateRecords": 3,
    "invalidRecords": 2,
    "preview": []
  }
}
```

---

# 8. Execute Import

## Endpoint

```http
POST /api/v1/imports/csv/{id}/confirm
```

Imports all valid, confirmed records.

Example Response

```json
{
  "success": true,
  "message": "Import completed successfully.",
  "data": {
    "importedRecords": 145,
    "duplicateRecords": 3,
    "failedRecords": 2
  }
}
```

---

# 9. Import History

## Endpoint

```http
GET /api/v1/imports/csv
```

Supports:

- Pagination
- Filtering
- Sorting

Returns previous imports.

---

# 10. Import Details

## Endpoint

```http
GET /api/v1/imports/csv/{id}
```

Returns:

- File name
- Upload date
- Status
- Total records
- Imported records
- Failed records
- Validation summary

---

# 11. Cancel Import

## Endpoint

```http
DELETE /api/v1/imports/csv/{id}
```

Only imports that have not started processing may be cancelled.

Completed imports cannot be cancelled.

---

# 12. Validation Rules

Validation includes:

- File must be CSV.
- UTF-8 encoding required.
- Maximum file size within configured limit.
- Required columns must exist.
- Dates must be valid.
- Amounts must be numeric.
- Invalid rows are reported individually.

Validation failures return HTTP 422.

The current transaction schema requires a category. CSV rows must therefore
include a category name or category UUID resolvable to one of the authenticated
user's categories or system categories; rows without one are reported invalid.

---

# 13. Duplicate Detection

Duplicate detection considers:

- Transaction Date
- Amount
- Merchant Name
- Transaction Type

Potential duplicates are flagged during preview.

Users decide whether flagged records should be imported.

Duplicate detection never deletes existing transactions.

---

# 14. Response Examples

Import Summary

```json
{
  "success": true,
  "data": {
    "status": "COMPLETED",
    "totalRecords": 150,
    "imported": 145,
    "duplicates": 3,
    "failed": 2
  }
}
```

Import History

```json
{
  "success": true,
  "data": [],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 8
  }
}
```

---

# 15. Error Responses

| HTTP | Error Code               |
| ---- | ------------------------ |
| 400  | INVALID_FILE             |
| 401  | UNAUTHORIZED             |
| 403  | FORBIDDEN                |
| 404  | IMPORT_NOT_FOUND         |
| 409  | IMPORT_ALREADY_COMPLETED |
| 413  | FILE_TOO_LARGE           |
| 415  | UNSUPPORTED_FILE_TYPE    |
| 422  | VALIDATION_ERROR         |
| 500  | INTERNAL_SERVER_ERROR    |

Responses follow `errors.md`.

---

# 16. Business Rules

- Users may import only into their own account.
- Original uploaded files are retained for audit purposes according to the retention policy.
- Imports are immutable after completion.
- Only valid records are imported.
- Duplicate detection occurs before import.
- Successful imports emit domain events to refresh Dashboard, Budgets, Analytics, Goals, and AI Insights.

---

# 17. Design Principles

- Upload once, import once
- Preview before import
- Non-destructive imports
- Strong validation
- Detailed error reporting
- Event-driven updates
- Consistent response format
- User ownership enforcement

---

# References

- api_overview.md
- authentication.md
- errors.md
- pagination.md
- ../development/features/csv_import.md
- ../architecture/import_architecture.md

---

> **API Principle:** The CSV Import API provides a safe, transparent, and auditable way to import financial data. Every import is validated, previewed, and confirmed before affecting the user's financial records, ensuring accuracy while preserving existing data.
