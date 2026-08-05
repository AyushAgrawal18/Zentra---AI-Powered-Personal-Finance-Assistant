# Feature Specification: SMS Transaction Parser
# 📩 SMS Suggestions Feature Specification

> **Project:** Zentra
>
> **Version:** 1.0.0
>
> **Feature ID:** F-008
>
> **Priority:** P0
>
> **Status:** Planned
>
> **Owner:** Backend & Frontend Team

---

# Table of Contents

1. Purpose
2. Business Value
3. Objectives
4. Scope
5. Out of Scope
6. SMS Processing Flow
7. Supported SMS Types
8. Transaction Extraction
9. Merchant Recognition
10. Duplicate Detection
11. User Stories
12. Functional Requirements
13. Business Rules
14. Error Handling
15. Security
16. API Dependencies
17. Future Scope
18. Acceptance Criteria
19. LLM Notes

---

# 1. Purpose

The SMS Suggestions module automatically extracts financial transactions from bank and UPI SMS messages and presents them to the user for review before importing them into Zentra.

Version 1 focuses on **suggesting** transactions. The user always has the final decision to import or reject them.

---

# 2. Business Value

SMS Suggestions help users:

- Reduce manual data entry
- Capture day-to-day expenses
- Maintain accurate financial history
- Import transactions instantly
- Improve budgeting accuracy

---

# 3. Objectives

The module should:

- Read supported financial SMS messages
- Extract transaction details
- Detect duplicates
- Identify merchants
- Suggest categories
- Allow users to review before saving

---

# 4. Scope

Version 1 includes:

- SMS Parsing
- Merchant Detection
- Amount Extraction
- Date Extraction
- Duplicate Detection
- User Review Screen
- Manual Approval
- Transaction Creation

---

# 5. Out of Scope

Version 1 excludes:

- Automatic transaction creation
- Reading deleted SMS
- Cloud SMS backup
- OCR from screenshots
- WhatsApp payment messages
- Email transaction parsing

---

# 6. SMS Processing Flow

```
SMS Received

↓

Permission Granted

↓

Read SMS

↓

Detect Financial SMS

↓

Extract Details

↓

Validate

↓

Detect Duplicates

↓

Suggest Category

↓

User Reviews

↓

Approve / Reject

↓

Create Transaction

↓

Update Dashboard
```

---

# 7. Supported SMS Types

Version 1 supports SMS from:

### Banks

- SBI
- HDFC
- ICICI
- Axis
- Kotak
- IDFC FIRST
- Bank of Baroda
- Punjab National Bank
- Canara Bank

---

### UPI Apps

- Google Pay
- PhonePe
- Paytm
- BHIM

---

### Card Transactions

- Debit Card
- Credit Card

---

# 8. Transaction Extraction

The parser should extract:

- Transaction Amount
- Transaction Type
- Date
- Time (if available)
- Merchant Name
- UPI ID (if available)
- Reference Number
- Bank Name
- Account Identifier (masked)
- Available Balance (optional)

Example

```
₹250

↓

Expense

↓

Merchant

Starbucks

↓

Date

12 Aug 2026
```

---

# 9. Merchant Recognition

Merchant names should be cleaned before display.

Examples

```
AMAZON SELLER SERVICES

↓

Amazon
```

```
SWIGGY LIMITED

↓

Swiggy
```

```
ZOMATO ONLINE

↓

Zomato
```

If merchant recognition fails:

Display the original description.

Merchant recognition should never modify the original SMS data.

---

# 10. Duplicate Detection

Duplicates should be detected using:

- Amount
- Date
- Merchant
- Transaction Type
- Reference Number (if available)

Possible results:

- New Transaction
- Possible Duplicate
- Exact Duplicate

Rules

- Exact duplicates cannot be imported.
- Possible duplicates require user confirmation.

---

# 11. User Stories

### US-801

As a user,

I want Zentra to detect financial SMS messages,

so that I don't have to enter every transaction manually.

---

### US-802

As a user,

I want to review detected transactions,

so that incorrect data is not imported.

---

### US-803

As a user,

I want duplicate transactions to be identified,

so my financial records remain accurate.

---

# 12. Functional Requirements

## FR-801

Read financial SMS messages.

---

## FR-802

Extract transaction details.

---

## FR-803

Recognize merchant names.

---

## FR-804

Suggest transaction category.

---

## FR-805

Detect duplicates.

---

## FR-806

Allow manual approval.

---

## FR-807

Create transactions after approval.

---

## FR-808

Maintain SMS import history.

---

# 13. Business Rules

- User approval is mandatory before creating transactions.
- Original SMS content must never be modified.
- Imported transactions become normal transaction records.
- Rejected suggestions remain rejected unless rescanned.
- Duplicate transactions must never be imported.
- SMS Suggestions are not financial records.
- Transactions remain the source of truth.

---

# 14. Error Handling

Possible errors:

- SMS permission denied
- Unsupported SMS format
- Corrupted message
- Missing amount
- Missing date
- Duplicate transaction
- Parsing failure

Errors should be logged without interrupting processing of other SMS messages.

---

# 15. Security

- Explicit SMS permission required.
- Only financial SMS messages should be processed.
- SMS content must never leave the user's device unless required for parsing.
- Sensitive information must be masked in logs.
- Users may revoke SMS access at any time.

---

# 16. API Dependencies

Depends on:

- Authentication
- Transactions
- Categories
- Dashboard
- Analytics
- Notifications

---

# 17. Future Scope

Version 2

- AI Merchant Recognition
- Better Category Prediction
- Automatic Recurring Transaction Detection
- Receipt Linking

Version 3

- Real-time SMS monitoring
- Multi-language SMS support
- Cross-device synchronization
- Personalized merchant database

---

# 18. Acceptance Criteria

The SMS Suggestions feature is complete when:

- Financial SMS messages are detected.
- Transaction details are extracted correctly.
- Merchant names are recognized.
- Duplicate detection works.
- User approval workflow functions correctly.
- Approved transactions are created successfully.
- Dashboard updates automatically.

---

# 19. LLM Notes

When implementing SMS Suggestions:

- Never create transactions automatically.
- Treat SMS parsing as an import workflow, not a transaction workflow.
- Keep SMS parsing, validation, and transaction creation as separate steps.
- Reuse duplicate detection logic from the CSV Import module.
- Preserve the original SMS content for auditing.
- Merchant recognition should be modular and easily extensible.
- Transactions should always be created through the Transaction Service.

---

# References

- transactions.md
- csv.md
- categories.md
- dashboard.md
- analytics.md

---

> **Implementation Principle:** SMS Suggestions assist users in importing financial data. Every detected transaction must be reviewed by the user before becoming part of their financial records, ensuring accuracy, transparency, and user control.