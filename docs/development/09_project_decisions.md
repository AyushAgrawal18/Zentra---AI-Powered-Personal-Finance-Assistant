# 📘 Project Decisions (Architecture Decision Records)

> **Project:** Zentra
>
> **Version:** 1.0.0
>
> **Status:** Locked
>
> **Document Type:** Architecture Decision Record (ADR)

---

# Table of Contents

1. Purpose
2. Decision Guidelines
3. Accepted Decisions
4. Future Decisions
5. Rejected Alternatives
6. Decision Log
7. Rules

---

# 1. Purpose

This document records important architectural and technical decisions made during the development of Zentra.

Each decision includes:

- Context
- Decision
- Reasoning
- Alternatives Considered
- Consequences

This document serves as the project's single source of truth for major technical choices.

---

# 2. Decision Guidelines

Every significant technical decision must be documented before implementation.

Each decision should answer:

- What problem are we solving?
- What options were considered?
- Why was this option selected?
- What are the trade-offs?

---

# 3. Accepted Decisions

---

## ADR-001

### Title

Feature-Based Architecture

### Status

Accepted

### Decision

The backend will use a feature-based architecture where each feature owns its routes, controllers, services, repositories, validations, events, constants, and utilities.

### Reason

- Better modularity
- Easier maintenance
- Faster onboarding
- Clear ownership
- Scalable codebase

### Alternatives

- Layer-based architecture

### Decision Date

Planning Phase

---

## ADR-002

### Title

Backend Framework

### Status

Accepted

### Decision

Node.js with Express.js will be used.

### Reason

- Large ecosystem
- Excellent PostgreSQL support
- Fast development
- Suitable for REST APIs

### Alternatives

- NestJS
- Fastify
- Django
- Spring Boot

---

## ADR-003

### Title

Frontend Framework

### Status

Accepted

### Decision

Next.js will be used for the web application.

### Reason

- Excellent developer experience
- Built-in routing
- Performance
- SEO support
- Easy deployment

### Alternatives

- React + Vite
- Angular
- Vue

---

## ADR-004

### Title

Mobile Framework

### Status

Accepted

### Decision

Flutter will be used for the mobile application.

### Reason

- Single codebase
- Excellent UI
- Strong community support

### Alternatives

- React Native
- Native Android
- Kotlin Multiplatform

---

## ADR-005

### Title

Database

### Status

Accepted

### Decision

PostgreSQL will be the primary database.

### Reason

- ACID compliance
- Strong relational support
- Excellent performance
- Reliable transactions

### Alternatives

- MongoDB
- MySQL
- SQLite

---

## ADR-006

### Title

Authentication

### Status

Accepted

### Decision

JWT Authentication with Refresh Tokens.

### Reason

- Stateless authentication
- Secure sessions
- Industry standard

### Alternatives

- Session-based authentication
- OAuth only

---

## ADR-007

### Title

Payments

### Status

Accepted

### Decision

Version 1 will support UPI Deep Links only.

### Reason

- No banking approvals required
- Fast implementation
- Supports all major UPI apps
- Fits MVP scope

### Alternatives

- UPI Intent SDK
- Payment Gateway
- Direct bank integration

### Important

Zentra never processes payments.

Payments are completed inside third-party UPI applications.

---

## ADR-008

### Title

AI Provider

### Status

Accepted

### Decision

Use a provider abstraction layer.

### Reason

Allows switching between:

- Gemini
- OpenAI
- Claude

without changing application logic.

---

## ADR-009

### Title

Database Access

### Status

Accepted

### Decision

Use the Repository Pattern.

### Reason

- Separation of concerns
- Easier testing
- Cleaner business logic

---

## ADR-010

### Title

Architecture Style

### Status

Accepted

### Decision

Event-driven communication between modules.

### Reason

- Loose coupling
- Better scalability
- Easier feature expansion

---

## ADR-011

### Title

Primary Currency

### Status

Accepted

### Decision

Version 1 supports Indian Rupee (INR) only.

### Reason

- Simpler MVP
- Reduced complexity
- Primary target audience is India

Future versions may support multiple currencies.

---

## ADR-012

### Title

Documentation First

### Status

Accepted

### Decision

Every feature must be documented before implementation.

### Reason

- Better planning
- Easier collaboration
- Improved AI-assisted development
- Reduced rework

---

# 4. Future Decisions

The following decisions are intentionally postponed:

- Bank API integrations
- Investment tracking
- OCR receipts
- Multi-currency support
- Family accounts
- Push notifications
- Subscription detection

These will be documented when development begins.

---

# 5. Rejected Alternatives

| Alternative | Reason for Rejection |
|-------------|----------------------|
| MongoDB | Relational data model better suits finance |
| Direct UPI Processing | Outside MVP scope and regulatory complexity |
| Layer-Based Architecture | Less modular for feature growth |
| Hardcoded AI Provider | Difficult to switch providers later |
| Monolithic Service Classes | Can become difficult to maintain as features grow |

---

# 6. Decision Log

| ADR | Decision | Status |
|------|----------|--------|
| ADR-001 | Feature-Based Architecture | ✅ Accepted |
| ADR-002 | Node.js + Express | ✅ Accepted |
| ADR-003 | Next.js | ✅ Accepted |
| ADR-004 | Flutter | ✅ Accepted |
| ADR-005 | PostgreSQL | ✅ Accepted |
| ADR-006 | JWT Authentication | ✅ Accepted |
| ADR-007 | UPI Deep Links | ✅ Accepted |
| ADR-008 | AI Provider Abstraction | ✅ Accepted |
| ADR-009 | Repository Pattern | ✅ Accepted |
| ADR-010 | Event-Driven Architecture | ✅ Accepted |
| ADR-011 | INR Only (v1) | ✅ Accepted |
| ADR-012 | Documentation First | ✅ Accepted |

---

# 7. Rules

Every future architectural decision must:

- Be documented before implementation.
- Include context and reasoning.
- Evaluate alternatives.
- Consider long-term maintainability.
- Be reviewed before adoption.

Major architectural changes must update this document before code changes are introduced.

---

> **Decision Principle:** Every major technical choice in Zentra should be intentional, documented, and justified. Decisions should optimize for maintainability, scalability, and clarity rather than short-term convenience.