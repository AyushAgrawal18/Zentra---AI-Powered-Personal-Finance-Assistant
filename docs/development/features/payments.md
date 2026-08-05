# Feature Specification: UPI Payments & Deep Links
# 💳 Payments Feature Specification

> **Project:** Zentra
>
> **Version:** 1.0.0
>
> **Feature ID:** F-012
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
6. Payment Architecture
7. Payment Flow
8. Payment Lifecycle
9. Supported Payment Methods
10. User Stories
11. Functional Requirements
12. Payment Reconciliation
13. Business Rules
14. Security
15. API Dependencies
16. Future Scope
17. Acceptance Criteria
18. LLM Notes

---

# 1. Purpose

The Payments module allows users to initiate UPI payments directly from Zentra using standard UPI Deep Links.

Zentra simplifies the payment experience while continuing to use trusted UPI applications such as Google Pay, PhonePe, Paytm and BHIM to complete the actual payment.

---

# 2. Business Value

Payments allow users to:

- Pay merchants directly from Zentra
- Record payments automatically
- Link payments with expenses
- Avoid manual transaction entry
- Keep financial records accurate

---

# 3. Objectives

The Payments module should:

- Generate valid UPI Deep Links
- Launch installed UPI applications
- Track payment attempts
- Reconcile completed payments
- Automatically create transaction entries after successful reconciliation

---

# 4. Scope

Version 1 includes:

- UPI Deep Link generation
- Payment Intent creation
- Launch supported UPI apps
- Payment history
- Manual payment reconciliation
- Automatic transaction creation after successful reconciliation

---

# 5. Out of Scope

Version 1 does NOT include:

- Direct UPI processing
- Payment gateway integration
- Wallet functionality
- Card payments
- Net Banking
- International payments
- Refund processing
- Payment settlements

---

# 6. Payment Architecture

```
User

↓

Create Payment

↓

Generate Payment Intent

↓

Generate UPI Deep Link

↓

Launch UPI App

↓

User Completes Payment

↓

Return To Zentra

↓

Reconciliation

↓

Create Transaction

↓

Update Dashboard
```

---

# 7. Payment Flow

Step 1

User enters

- Merchant Name
- UPI ID
- Amount
- Category
- Note (Optional)

↓

Step 2

Backend creates Payment Intent

↓

Step 3

Frontend generates UPI Deep Link

↓

Step 4

Google Pay / PhonePe / Paytm / BHIM opens

↓

Step 5

User authorizes payment

↓

Step 6

User returns to Zentra

↓

Step 7

Payment is reconciled

↓

Step 8

Expense transaction is created

---

# 8. Payment Lifecycle

```
Created

↓

Pending

↓

Initiated

↓

Completed

OR

Failed

OR

Cancelled

↓

Reconciled
```

---

# 9. Supported Payment Methods

Version 1

✅ Google Pay

✅ PhonePe

✅ Paytm

✅ BHIM

Any application supporting the standard UPI Deep Link specification should work.

---

# 10. User Stories

### US-1201

As a user,

I want to pay a merchant directly from Zentra,

so I don't have to manually open another app.

---

### US-1202

As a user,

I want completed payments to automatically appear in my transaction history,

so I don't need to enter them manually.

---

### US-1203

As a user,

I want to view my previous payment attempts,

so I can verify my payment history.

---

# 11. Functional Requirements

## FR-1201

Generate Payment Intent.

---

## FR-1202

Generate UPI Deep Link.

---

## FR-1203

Launch installed UPI application.

---

## FR-1204

Store payment attempt.

---

## FR-1205

Support reconciliation.

---

## FR-1206

Create transaction after successful reconciliation.

---

## FR-1207

Maintain payment history.

---

# 12. Payment Reconciliation

After the user returns to Zentra:

System checks:

- Was payment completed?
- Does payment already exist?
- Is duplicate prevention required?

If successful:

↓

Create Transaction

↓

Update Dashboard

↓

Update Budget

↓

Update Goal Progress (if applicable)

↓

Notify User

Payment reconciliation must always prevent duplicate transaction creation.

---

# 13. Business Rules

- Zentra never processes payments.
- Payments always occur inside external UPI applications.
- Every payment attempt receives a unique Payment Intent ID.
- Reconciliation must be idempotent.
- Duplicate payment reconciliation is not allowed.
- Successful payments create transactions automatically.
- Failed payments never create expense transactions.

---

# 14. Security

- Authentication required.
- Authorization required.
- Users can access only their own payment history.
- Never store UPI PIN.
- Never intercept payment credentials.
- Validate all input before generating payment intents.

---

# 15. API Dependencies

Payments depend on:

- Authentication
- Transactions
- Categories
- Dashboard
- Notifications

---

# 16. Future Scope

Version 2

- Saved Beneficiaries
- QR Code Payments
- Payment Templates
- Scheduled Payments

Version 3

- Bank API Integration
- Merchant Verification
- Payment Analytics
- Smart Payment Suggestions

---

# 17. Acceptance Criteria

The Payments module is complete when:

- Payment Intent is created.
- UPI Deep Link is generated correctly.
- Supported UPI applications launch successfully.
- Payment history is maintained.
- Reconciliation prevents duplicates.
- Successful payments create transactions.
- Dashboard updates correctly.

---

# 18. LLM Notes

When implementing Payments:

- Zentra is NOT a payment processor.
- Never attempt to collect or process UPI PINs.
- Use standard UPI Deep Links only.
- Payment completion must always be verified through reconciliation.
- Payment reconciliation must be idempotent.
- Payment records and financial transactions are separate entities.
- Do not assume a payment succeeded simply because the user returned to the app.
- The transaction module remains the source of truth for financial records.

---

# References

- transactions.md
- dashboard.md
- analytics.md
- notifications.md
- docs/integrations/upi.md

---

> **Implementation Principle:** Zentra initiates payments but never processes them. All payments are completed inside trusted UPI applications, while Zentra focuses on payment initiation, reconciliation, and accurate financial record keeping.