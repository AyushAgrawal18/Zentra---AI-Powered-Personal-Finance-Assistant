# 📋 Software Requirements Specification (SRS)

> **Project:** Zentra  
> **Version:** 1.0.0  
> **Status:** Planning  
> **Document Type:** Software Requirements Specification (SRS)

---

# Table of Contents

1. Introduction
2. Stakeholders
3. User Personas
4. Functional Requirements
5. Non-Functional Requirements
6. Business Rules
7. System Constraints
8. Assumptions
9. User Stories
10. Acceptance Criteria
11. Requirement Traceability
12. Security Requirements
13. Performance Requirements
14. Accessibility Requirements
15. Future Requirements
16. LLM Implementation Notes

---

# 1. Introduction

## Purpose

This document defines all functional and non-functional requirements for Zentra.

It acts as the single source of truth for:

- Product Design
- Backend Development
- Frontend Development
- Flutter Development
- Database Design
- API Design
- Testing
- AI Feature Development

Every implemented feature must satisfy at least one requirement defined in this document.

---

## Intended Audience

- Product Owner
- Backend Developers
- Frontend Developers
- Flutter Developers
- QA Engineers
- AI Engineers
- Future Contributors
- LLM Coding Assistants

---

## Scope

Version 1 includes:

- Authentication
- Dashboard
- Transactions
- Categories
- Budgets
- Goals
- Analytics
- AI Chat
- AI Insights
- CSV Import
- SMS Suggestions
- Notifications
- Profile
- Settings
- UPI Payment Initiation (Deep Links)
- Payment Intent Tracking
- Payment Reconciliation

---

# 2. Stakeholders

| Stakeholder | Responsibility |
|-------------|---------------|
| End User | Uses Zentra |
| Developer | Builds the platform |
| Administrator | Maintains the system |
| AI Service | Generates financial insights |
| Future Banking Integrations | External financial services |

---

# 3. User Personas

## Persona 1 — Student

### Goals

- Track expenses
- Save money
- Build financial discipline

### Pain Points

- Limited income
- Cash spending
- Forgets transactions

---

## Persona 2 — Working Professional

### Goals

- Monthly budgeting
- Expense analytics
- Savings planning

### Pain Points

- High transaction volume
- Subscription tracking
- Budget management

---

## Persona 3 — Freelancer

### Goals

- Track income
- Separate business and personal expenses
- Understand cash flow

---

## Persona 4 — Small Business Owner

### Goals

- Daily expense management
- Income tracking
- Monthly reports

---

# 4. Functional Requirements

---

# Authentication

## FR-001 User Registration

### Description

The system shall allow a new user to register using email and password.

Priority: High

Actors:

- Guest

Database:

users

Frontend:

Register Page

Backend:

Auth Module

API:

POST /auth/register

Acceptance Criteria

- Valid email accepted
- Password validated
- Duplicate email rejected

---

## FR-002 Login

The system shall authenticate users using email and password.

API

POST /auth/login

Returns

- Access Token
- Refresh Token

---

## FR-003 Logout

Invalidate refresh token.

---

## FR-004 Refresh Token

Issue new access token.

---

## FR-005 Forgot Password

Allow password reset using email verification.

---

# Dashboard

## FR-100 Dashboard Overview

Display

- Monthly Spending
- Income
- Budget Progress
- Savings Goals
- AI Insights
- Recent Transactions
- Quick Actions

---

# Transactions

## FR-200 Create Transaction

The system shall allow authenticated users to create financial transactions.

Input

- Amount
- Type
- Category
- Merchant
- Date
- Notes
- Payment Method

Validation

- Amount > 0
- Category Required
- Date Required

Database

transactions

API

POST /transactions

Acceptance Criteria

- Transaction saved
- Dashboard updated
- Budget recalculated
- Analytics updated

---

## FR-201 Edit Transaction

Update existing transaction.

---

## FR-202 Delete Transaction

Soft delete only.

---

## FR-203 Search Transactions

Search by

- Merchant
- Notes

---

## FR-204 Filter Transactions

Filter by

- Date
- Category
- Type
- Amount

---

## FR-205 Pagination

Large transaction lists shall support pagination.

---

# Categories

## FR-300 Category Management

Users shall

- Create
- Edit
- Delete
- View Categories

---

# Budgets

## FR-400 Budget Management

Users shall

- Create Budget
- Update Budget
- Delete Budget
- View Progress

---

## FR-401 Budget Alerts

Notify users when spending exceeds configurable thresholds.

---

# Goals

## FR-500 Savings Goals

Users shall

- Create Goals
- Edit Goals
- Delete Goals
- Track Progress

---

# CSV Import

## FR-600 CSV Upload

Users shall upload bank statements.

Supported

- CSV

---

## FR-601 CSV Validation

Validate

- Columns
- Amount
- Date

---

## FR-602 Import History

Maintain upload history.

---

# SMS Suggestions

## FR-700 SMS Detection

Display detected transactions.

---

## FR-701 Accept Suggestion

Create transaction.

---

## FR-702 Reject Suggestion

Discard suggestion.

---

## FR-703 Duplicate Detection

Detect duplicate transactions using configurable matching rules (e.g., amount, date/time window, merchant similarity).

If confidence is high, suggest a merge rather than automatically deleting or overwriting records.

---

# AI Chat

## FR-800 AI Chat

Users may ask financial questions.

Examples

- Where did I spend the most?

- Suggest savings.

- Compare months.

---

# AI Insights

## FR-900 AI Insights

Generate

- Monthly Summary
- Spending Trends
- Category Insights
- Budget Suggestions

---

# Payments

## FR-1000 Payment Initiation

Generate UPI Deep Link.

Launch

- Google Pay
- PhonePe
- BHIM
- Paytm

---

## FR-1001 Payment Intent

Create payment intent before launching UPI.

---

## FR-1002 Payment Reconciliation

Verify payment using

- SMS
- CSV
- Manual Confirmation

---

# Notifications

## FR-1100 Notifications

Generate alerts for

- Budget
- Goals
- AI
- Payments

---

# Profile

## FR-1200 Profile

Update

- Name
- Avatar
- Currency
- Preferences

---

# Settings

## FR-1300 Settings

Manage

- Theme
- Notifications
- Privacy
- Security

---

# 5. Non-Functional Requirements

## Performance

| Requirement | Target |
|-------------|---------|
| Dashboard | < 2 sec |
| API Response | < 500 ms (typical requests) |
| AI Response | < 10 sec |
| CSV Import | 10,000 rows |

---

## Security

The application shall implement

- JWT Authentication
- Refresh Tokens
- Password Hashing
- Helmet
- CORS
- Rate Limiting
- Input Validation
- SQL Injection Protection
- XSS Protection

---

## Availability

Target uptime

99%

---

## Scalability

Support

- 100,000 Users

- 1 Million Transactions

without major architectural changes.

---

## Maintainability

Architecture

Feature Based

Repository Pattern

Reusable Components

Centralized Error Handling

---

# 6. Business Rules

BR-001

Budget cannot become negative.

---

BR-002

Transactions use soft delete.

---

BR-003

Income and Expense store positive amounts.

The transaction type differentiates them.

---

BR-004

Every payment intent belongs to exactly one transaction.

---

BR-005

Duplicate transaction suggestions require explicit user confirmation before merging or discarding.

---

BR-006

AI-generated insights are advisory only and must not be treated as financial advice.

---

# 7. System Constraints

- JavaScript only
- No TypeScript
- PostgreSQL
- Node.js
- Express.js
- Flutter (Phase 2)
- REST API
- JWT Authentication

---

# 8. Assumptions

- Internet available
- AI service available
- User has UPI application installed
- SMS permission granted on mobile
- CSV follows supported format

---

# 9. User Stories

As a student,

I want to import my bank statement,

so I don't manually enter transactions.

---

As a working professional,

I want AI recommendations,

so I can reduce unnecessary spending.

---

As a user,

I want to initiate a UPI payment,

so I can pay without manually copying details into another app.

---

# 10. Acceptance Criteria

Every feature must

- Pass validation
- Handle errors gracefully
- Be responsive
- Be documented
- Have API documentation
- Follow coding standards

---

# 11. Requirement Traceability

| Requirement | Module | API | Database |
|-------------|--------|-----|----------|
| FR-001 | Auth | POST /auth/register | users |
| FR-200 | Transactions | POST /transactions | transactions |
| FR-400 | Budgets | POST /budgets | budgets |
| FR-500 | Goals | POST /goals | goals |
| FR-600 | CSV | POST /csv/upload | imports |
| FR-700 | SMS | GET /sms/suggestions | sms_imports |
| FR-800 | AI Chat | POST /chat | chat_history |
| FR-1000 | Payments | POST /payments/initiate | payment_intents |

---

# 12. Security Requirements

- JWT Authentication
- Refresh Tokens
- HTTPS in production
- Password hashing (bcrypt)
- Role-based authorization (if introduced)
- Input validation
- SQL Injection prevention
- XSS protection
- Secure HTTP headers

---

# 13. Accessibility Requirements

The application should:

- Be keyboard navigable.
- Support screen readers where practical.
- Maintain sufficient color contrast.
- Be responsive across devices.

---

# 14. Future Requirements

- Investment Tracking
- Net Worth Dashboard
- Subscription Detection
- OCR Receipt Scanner
- Voice Assistant
- Family Accounts
- Shared Budgets
- Banking Integrations (subject to supported APIs)

---

# 15. LLM Implementation Notes

The following rules apply when generating code:

- Do not change the project architecture.
- Do not introduce TypeScript.
- Do not replace PostgreSQL.
- Follow feature-based architecture.
- Maintain Controller → Service → Repository separation.
- Reuse components instead of duplicating logic.
- Never hardcode secrets.
- Payments use UPI Deep Links only.
- Do not implement NPCI or banking APIs.
- Flutter is Phase 2 and shares the same backend APIs.
- All APIs must return a consistent response format.
- Keep business logic in services, not controllers.
- Update documentation when adding or changing features.

---

# Revision History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | Planning | Initial SRS created |

---

> **This document serves as the implementation contract for Zentra v1.0. Every feature, API, database table, and UI screen must trace back to one or more requirements defined here.**