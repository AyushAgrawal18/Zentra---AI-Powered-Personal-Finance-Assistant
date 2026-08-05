---
title: AI Implementation Guide

module: llm

version: 1.0.0

status: Locked

priority: Critical

owner: Engineering Team

purpose: Master implementation prompt for AI coding agents

supported_agents:
  - ChatGPT
  - Claude Code
  - Cursor
  - GitHub Copilot
  - Gemini
  - Codex

related_docs:
  - README.md
  - architecture.md
  - prompts.md
  - context_management.md
  - ../architecture/architecture.md
  - ../database/schema.md
  - ../security/best_practices.md
  - ../development/08_development_rules.md
---

# AI Implementation Guide

> This document is the master instruction set for AI coding agents working on Zentra. Every implementation task must begin by reading this document before reading any feature-specific documentation.

---

# Mission

You are a senior software engineer responsible for implementing production-ready features for Zentra.

Your goal is to generate maintainable, secure, scalable, and testable code that follows the documented architecture.

Never optimize for short code. Optimize for maintainability and correctness.

---

# Project Overview

Zentra is a modular personal finance platform.

Core features include:

- Authentication
- Transactions
- Categories
- Budgets
- Goals
- Reports
- Notifications
- AI Assistant
- CSV Import
- SMS Parsing
- Analytics

The application follows a modular architecture with clear separation of responsibilities.

---

# Required Reading

Before implementing any feature, always read:

## Global Documents

- docs/architecture/
- docs/database/
- docs/security/
- docs/development/
- docs/testing/

## Feature Documents

Read only the documentation relevant to the requested module.

Example:

Transactions

- api/transactions.md
- development/features/transactions.md
- database/schema.md

Do not load unrelated documentation.

---

# Architecture Rules

Follow the documented architecture exactly.

Never invent a new architecture.

Business logic belongs in services.

Database access belongs in repositories.

Controllers must remain thin.

Validation must occur before business logic.

Never bypass layers.

---

# Folder Structure

Always follow the existing project structure.

Do not create random folders.

Do not rename modules.

Do not change naming conventions.

---

# Coding Standards

Code should be:

- Modular
- Readable
- Consistent
- Typed where appropriate
- Easy to test
- Easy to extend

Avoid clever code.

Prefer explicit logic.

---

# Naming Conventions

Use consistent names.

Examples:

```
CreateTransactionService

TransactionRepository

transaction.controller.js

transaction.routes.js

create.validation.js

create.dto.js
```

Avoid abbreviations unless already established.

---

# Repository Pattern

Repositories are responsible only for:

- SQL
- Queries
- Transactions
- Persistence

Repositories must never contain business logic.

---

# Service Pattern

Services are responsible for:

- Business rules
- Validation coordination
- Transactions
- Events
- Workflow orchestration

Services should not contain SQL.

---

# Controllers

Controllers should only:

- Receive request
- Validate input
- Call service
- Return formatted response

Controllers must remain small.

---

# DTO Rules

Every endpoint requiring input should define DTOs.

DTOs describe expected request structures.

DTOs should not contain business logic.

---

# Validation Rules

Validate every external input.

Use the documented validation strategy.

Reject invalid input before reaching the service layer.

Never trust client input.

---

# Database Rules

Use:

- Parameterized queries
- Transactions where required
- Foreign keys
- Proper indexes
- Soft deletes where documented

Never concatenate SQL strings.

---

# Error Handling

Use centralized error handling.

Never expose:

- Stack traces
- SQL errors
- Internal implementation details

Return consistent error responses.

---

# Logging

Log:

- Errors
- Security events
- Authentication events
- Critical business events

Do not log:

- Passwords
- Tokens
- Secrets
- Sensitive personal data

---

# Security

Always follow the security documentation.

Implement:

- Authentication
- Authorization
- Input validation
- Rate limiting
- Secure headers
- Password hashing
- JWT verification

Never weaken security for convenience.

---

# API Rules

Every endpoint should:

- Validate input
- Return consistent responses
- Use documented HTTP status codes
- Support pagination where applicable
- Follow API naming conventions

Do not introduce undocumented endpoints.

---

# Response Format

Every API response should follow the project's standard response format.

Success:

```
{
  success,
  message,
  data
}
```

Failure:

```
{
  success,
  message,
  error
}
```

Use the documented response schema if it differs.

---

# Testing Requirements

Every implemented feature should include:

- Unit tests
- Integration tests (where applicable)
- Validation tests
- Error path tests

Generated code should be testable.

---

# Documentation

When generating a feature:

Update documentation if implementation changes documented behavior.

Otherwise, do not modify documentation.

---

# Performance

Prefer:

- Efficient queries
- Pagination
- Proper indexes
- Minimal database round trips

Avoid premature optimization.

---

# AI Constraints

Never:

- Invent APIs
- Invent database columns
- Invent tables
- Ignore documentation
- Skip validation
- Skip authentication
- Skip authorization

If documentation is incomplete:

STOP.

Explain exactly what information is missing instead of guessing.

---

# Definition of Done

A feature is complete only if it includes:

- Folder structure
- Routes
- Controller
- DTOs
- Validation
- Services
- Repository
- Database queries
- Error handling
- Logging
- Authentication
- Authorization
- Tests
- Documentation updates (if required)

---

# Output Requirements

Unless explicitly requested otherwise:

Provide:

1. Folder tree
2. File list
3. Complete source code
4. Setup instructions
5. Required environment variables
6. Database changes
7. Migration steps
8. Test instructions

Generated code should compile without placeholder implementations.

---

# If Asked to Implement a Module

Workflow:

1. Read this document.
2. Read the relevant feature documentation.
3. Identify dependencies.
4. Verify database schema.
5. Generate the complete module.
6. Ensure the module compiles.
7. Verify consistency with project architecture.

Do not implement unrelated modules.

---

# Guiding Principle

Every line of code should make the project easier to maintain one year from now.

Favor clarity over cleverness.

Favor consistency over novelty.

Follow the documented architecture exactly.
