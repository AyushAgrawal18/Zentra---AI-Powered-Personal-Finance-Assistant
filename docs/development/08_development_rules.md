# 📖 Zentra Development Rules

> **Project:** Zentra
>
> **Version:** 1.0.0
>
> **Status:** Active
>
> **Document Type:** Development Standards

---

# Table of Contents

1. Purpose
2. General Principles
3. Project Structure
4. Coding Standards
5. Architecture Rules
6. Database Rules
7. API Rules
8. Frontend Rules
9. Documentation Rules
10. Git Rules
11. Testing Rules
12. Security Rules
13. Code Review Checklist
14. Prohibited Practices
15. Definition of Done

---

# 1. Purpose

This document defines the mandatory development standards for Zentra.

Every contributor, including AI assistants, must follow these rules to maintain consistency, readability, scalability, and maintainability.

These rules apply to:

- Backend
- Frontend
- Mobile
- Documentation
- Database
- APIs

---

# 2. General Principles

Always:

- Keep code simple and readable.
- Follow existing architecture.
- Prefer reusable solutions.
- Document important decisions.
- Write maintainable code.
- Optimize only when necessary.

Never:

- Introduce unnecessary complexity.
- Duplicate logic.
- Ignore project conventions.
- Leave incomplete implementations.

---

# 3. Project Structure

Always follow the predefined folder structure.

Do not:

- Create random folders.
- Rename modules without updating documentation.
- Mix unrelated features.

Every feature must remain isolated inside its own module.

---

# 4. Coding Standards

General Rules

- Use meaningful variable names.
- Keep functions focused on one responsibility.
- Avoid deeply nested code.
- Prefer early returns.
- Remove unused code.
- Write consistent formatting.

Naming Conventions

Variables

```
camelCase
```

Functions

```
camelCase
```

Constants

```
UPPER_SNAKE_CASE
```

Files

```
kebab-case
```

Database Tables

```
snake_case
```

---

# 5. Architecture Rules

Follow the architecture defined in:

```
docs/architecture/
```

Business Logic

→ Services

Database Access

→ Repositories

HTTP Handling

→ Controllers

Validation

→ Middleware

Never bypass architectural layers.

---

# 6. Database Rules

- Use PostgreSQL.
- Use UUID primary keys.
- Use foreign keys where appropriate.
- Prefer normalized schema.
- Use transactions for multi-step operations.
- Never hard delete financial records.
- Always use parameterized queries.

---

# 7. API Rules

Every endpoint must:

- Validate input.
- Authenticate user (where required).
- Authorize access.
- Return standardized responses.
- Handle errors consistently.
- Be documented.

HTTP Methods

GET

Read

POST

Create

PATCH

Update

DELETE

Soft Delete

---

# 8. Frontend Rules

- Keep components reusable.
- Avoid duplicated UI.
- Make pages responsive.
- Handle loading and error states.
- Keep API calls separate from UI logic.
- Follow the design system.

---

# 9. Documentation Rules

Whenever implementation changes:

Update:

- Feature documentation
- API documentation
- Database documentation
- Architecture documentation (if required)
- Changelog

Documentation is part of development.

---

# 10. Git Rules

Commit Frequently

Good Examples

```
feat: add transaction search

fix: resolve budget calculation

docs: update roadmap

refactor: simplify dashboard service
```

Avoid

```
final

update

changes

test

abc
```

---

# 11. Testing Rules

Before merging:

- Feature works.
- Validation works.
- Error handling works.
- Existing functionality still works.
- Documentation updated.

---

# 12. Security Rules

Never:

- Store passwords in plain text.
- Commit secrets.
- Expose API keys.
- Trust client input.
- Skip authentication.

Always:

- Hash passwords.
- Validate input.
- Verify ownership.
- Use HTTPS in production.
- Protect sensitive routes.

---

# 13. Code Review Checklist

Before considering a feature complete:

- Code follows architecture.
- No duplicated logic.
- Naming is consistent.
- Documentation updated.
- No debug code.
- No commented-out code.
- Tests completed.
- Responsive UI verified.

---

# 14. Prohibited Practices

Do NOT:

- Copy code without understanding it.
- Mix frontend and backend logic.
- Hardcode secrets.
- Ignore errors.
- Bypass validation.
- Change architecture without documentation.
- Implement undocumented features.

---

# 15. Definition of Done

A task is complete only when:

- Feature implemented.
- Code reviewed.
- Tests completed.
- Documentation updated.
- No known critical bugs.
- Ready for deployment.

---

# Development Principles

1. Documentation before implementation.
2. Architecture before optimization.
3. Simplicity over cleverness.
4. Reuse over duplication.
5. Security by default.
6. Consistency across the project.
7. Every feature must be testable.
8. Every change must be documented.

---

> **Development Rule:** Every line of code should make Zentra easier to maintain, not harder.