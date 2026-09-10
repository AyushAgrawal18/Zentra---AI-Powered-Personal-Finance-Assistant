# Feature Specification: CSV Statement Import

# 📄 CSV Import Feature Specification

> **Project:** Zentra
>
> **Version:** 1.0.0
>
> **Feature ID:** F-007
>
> **Priority:** P0
>
> **Status:** Completed

Implementation note: the current `csv_imports` schema stores import metadata and
counts, but no file contents or row payload. Upload, preview, and confirmation
therefore share parsed rows in the running backend process; durable resume after
process restart requires a future schema extension and is intentionally not
invented here.

> **Owner:** Backend & Frontend Team

---

# Table of Contents

1. Purpose
2. Business Value
3. Objectives
4. Scope
5. Out of Scope
6. Import Workflow
7. Supported CSV Formats
8. Column Mapping
9. Import Process
10. Duplicate Detection
11. Validation Rules
12. User Stories
13. Functional Requirements
14. Business Rules
15. Error Handling
16. Security
17. API Dependencies
18. Future Scope
19. Acceptance Criteria
20. LLM Notes

---

# 1. Purpose

The CSV Import module enables users to import bank transaction statements into Zentra instead of manually entering each transaction.

The module should support CSV files exported by multiple Indian banks while providing preview, validation, duplicate detection, and reconciliation before importing data.

---

# 2. Business Value

CSV Import helps users:

- Save time
- Import months of transaction history
- Reduce manual errors
- Build financial history quickly
- Keep data synchronized with bank statements

---

# 3. Objectives

The module should:

- Support multiple bank formats
- Detect duplicate transactions
- Validate imported data
- Preview transactions before saving
- Allow partial imports
- Import only valid transactions

---

# 4. Scope

Version 1 includes:

- CSV Upload
- CSV Parsing
- Column Mapping
- Data Validation
- Preview Screen
- Duplicate Detection
- Import Confirmation
- Transaction Creation

---

# 5. Out of Scope

Version 1 excludes:

- Excel (.xlsx)
- PDF Statements
- OCR
- Automatic Bank Sync
- Scheduled Imports

---

# 6. Import Workflow

```
Upload CSV

↓

Validate File

↓

Detect Bank Format

↓

Parse CSV

↓

Map Columns

↓

Validate Data

↓

Detect Duplicates

↓

Preview

↓

User Confirms

↓

Create Transactions

↓

Update Dashboard

↓

Generate Import Summary
```

---

# 7. Supported CSV Formats

Version 1 supports:

- SBI
- HDFC Bank
- ICICI Bank
- Axis Bank
- Kotak Mahindra Bank
- IDFC FIRST Bank
- Bank of Baroda
- Generic CSV Format

Each supported format should have its own parser.

---

# 8. Column Mapping

Required Fields

| CSV Column  | Zentra Field               |
| ----------- | -------------------------- |
| Date        | Transaction Date           |
| Description | Merchant / Description     |
| Amount      | Amount                     |
| Type        | Income / Expense           |
| Balance     | Account Balance (Optional) |

Optional Fields

- Reference Number
- UPI ID
- Category
- Notes

---

# 9. Import Process

Step 1

User uploads CSV.

↓

Step 2

System detects CSV structure.

↓

Step 3

Columns are mapped.

↓

Step 4

Validation begins.

↓

Step 5

Duplicate transactions identified.

↓

Step 6

Preview displayed.

↓

Step 7

User selects transactions to import.

↓

Step 8

Transactions saved.

↓

Step 9

Dashboard, Budgets and Analytics updated.

---

# 10. Duplicate Detection

Duplicate detection should compare:

- Transaction Date
- Amount
- Merchant / Description
- Transaction Type
- Reference Number (if available)

Possible Results

- New Transaction
- Possible Duplicate
- Exact Duplicate

Users may manually override possible duplicates.

Exact duplicates should not be imported.

---

# 11. Validation Rules

Each row must satisfy:

- Valid date
- Valid amount
- Supported transaction type
- Required fields present
- No malformed values

Invalid rows should be skipped and reported.

---

# 12. User Stories

### US-701

As a user,

I want to import my bank statement,

so that I don't have to enter transactions manually.

---

### US-702

As a user,

I want to preview imported data,

so that I can verify everything before saving.

---

### US-703

As a user,

I want duplicate transactions to be detected,

so that my financial records remain accurate.

---

# 13. Functional Requirements

## FR-701

Upload CSV file.

---

## FR-702

Automatically detect supported format.

---

## FR-703

Map CSV columns.

---

## FR-704

Validate transaction rows.

---

## FR-705

Detect duplicate transactions.

---

## FR-706

Display preview.

---

## FR-707

Import selected rows.

---

## FR-708

Generate import summary.

---

# 14. Business Rules

- Original CSV files are never modified.
- Imported transactions become standard transactions.
- Duplicate transactions are not imported.
- Import history should be maintained.
- Users may import only their own files.
- Failed rows should not prevent successful rows from importing.

---

# 15. Error Handling

Possible Errors

- Unsupported file format
- Empty CSV
- Invalid columns
- Corrupted file
- Duplicate file
- Invalid transaction rows

The system should provide clear error messages and allow the user to retry.

---

# 16. Security

- Authentication required.
- Authorization required.
- Uploaded files processed securely.
- Temporary files deleted after processing.
- CSV data never shared across users.

---

# 17. API Dependencies

Depends on:

- Authentication
- Transactions
- Categories
- Dashboard
- Analytics

---

# 18. Future Scope

Version 2

- Excel Import
- PDF Statement Import
- OCR Support
- Auto Category Mapping
- Scheduled Imports

Version 3

- Direct Bank Synchronization
- Open Banking APIs
- Automatic Daily Imports

---

# 19. Acceptance Criteria

The CSV Import feature is complete when:

- CSV uploads successfully.
- Supported formats are detected.
- Data is validated.
- Preview is displayed.
- Duplicate detection works.
- Selected transactions are imported.
- Dashboard updates automatically.
- Import summary is generated.

---

# 20. LLM Notes

When implementing CSV Import:

- Each bank parser should be modular.
- Never assume all banks use the same column names.
- Separate parsing from validation.
- Duplicate detection must be reusable across CSV and SMS imports.
- Invalid rows should be reported instead of stopping the entire import.
- Imported transactions should use the same transaction creation service as manual entries.
- Store import metadata for audit purposes.

---

# References

- transactions.md
- categories.md
- dashboard.md
- analytics.md
- docs/database/schema.sql

---

> **Implementation Principle:** CSV Import is an assisted data ingestion feature. Its responsibility is to safely convert bank statements into verified transaction records while preserving data accuracy and preventing duplicates.
