---
title: Frontend Architecture

module: architecture

version: 1.0.0

status: Locked

priority: Critical

owner: Frontend Team

related_docs:
  - architecture.md
  - backend_architecture.md
  - mobile_architecture.md
  - ui/design_system.md
  - api/api_overview.md
---

# Frontend Architecture

> This document defines the architecture of the Zentra web application, including project structure, routing, state management, API communication, UI organization, and frontend design principles.

---

# Table of Contents

1. Purpose
2. Architectural Goals
3. Non Goals
4. Frontend Overview
5. Technology Stack
6. Folder Structure
7. Application Layers
8. Routing Architecture
9. State Management
10. API Communication
11. UI Component Architecture
12. Forms & Validation
13. Error Handling
14. Performance
15. Security
16. Accessibility
17. Design Principles
18. Locked Decisions
19. Future Evolution

---

# 1. Purpose

This document defines how the Zentra web application is organized.

It establishes:

- Folder organization
- Component hierarchy
- State management
- Routing
- API communication
- UI consistency

Every frontend feature must follow this architecture.

---

# 2. Architectural Goals

The frontend architecture should provide:

- Reusable UI
- Modular features
- Responsive layouts
- Fast rendering
- Simple maintenance
- Strong separation of concerns
- Excellent developer experience

---

# 3. Non Goals

Version 1 intentionally excludes:

- Server Components for business logic
- Micro-frontends
- Offline-first support
- Plugin architecture
- Multi-window synchronization

---

# 4. Frontend Overview

The Zentra web application is built using **Next.js** with a feature-based organization.

Responsibilities include:

- User Interface
- Client-side Routing
- API Communication
- Local UI State
- Authentication Flow
- Responsive Experience

Business logic remains inside the backend.

---

# 5. Technology Stack

Framework

- Next.js

Language

- JavaScript

UI

- Tailwind CSS
- shadcn/ui

Data Fetching

- React Query

Forms

- React Hook Form
- Zod

HTTP Client

- Axios

Charts

- Recharts

Icons

- Lucide Icons

---

# 6. Folder Structure

```
src/

├── app/
├── components/
├── features/
├── hooks/
├── services/
├── providers/
├── lib/
├── utils/
├── styles/
└── assets/
```

Each feature owns its own components whenever possible.

---

# 7. Application Layers

```
Pages

↓

Feature Components

↓

Shared Components

↓

Hooks

↓

API Services

↓

REST Backend
```

Responsibilities remain clearly separated.

---

# 8. Routing Architecture

Routes are organized using the Next.js App Router.

Example:

```
/

/login

/register

/dashboard

/transactions

/categories

/budgets

/goals

/analytics

/payments

/settings

/profile
```

Protected routes require authentication.

---

# 9. State Management

The frontend uses multiple state types.

## Server State

Managed using:

- React Query

Examples:

- Transactions
- Budgets
- Goals
- Analytics

---

## Local UI State

Managed using:

- React Hooks

Examples:

- Modal visibility
- Drawer state
- Search input
- Filters

---

## Global State

Used sparingly.

Examples:

- Theme
- Authentication
- User Preferences

Global state should not duplicate server state.

---

# 10. API Communication

All API communication follows:

```
UI

↓

React Query

↓

Axios Client

↓

REST API
```

Rules:

- No direct fetch() calls.
- Centralized API client.
- Automatic authentication headers.
- Standard error handling.

---

# 11. UI Component Architecture

Components are divided into:

## Shared Components

Examples:

- Button
- Card
- Modal
- Input
- Dialog
- Table

---

## Feature Components

Examples:

- Transaction Table
- Budget Card
- Goal Progress
- AI Chat Window

---

## Page Components

Responsible only for page composition.

Business logic should never exist inside page components.

---

# 12. Forms & Validation

Forms should use:

- React Hook Form
- Zod validation

Validation should occur:

- Client-side
- Server-side

Client validation improves UX but never replaces backend validation.

---

# 13. Error Handling

Frontend errors should include:

- User-friendly messages
- Retry options
- Loading recovery
- Graceful fallbacks

Unexpected errors should be logged.

---

# 14. Performance

Performance strategies include:

- Lazy loading
- Route-level code splitting
- Image optimization
- React Query caching
- Memoization where appropriate
- Virtualized tables for large datasets

---

# 15. Security

Frontend security includes:

- Secure JWT storage strategy
- Protected routes
- XSS prevention
- CSRF protection where applicable
- Secure API communication
- No sensitive logic on the client

---

# 16. Accessibility

The application should support:

- Keyboard navigation
- Screen readers
- ARIA labels
- Focus management
- Color contrast compliance
- Responsive layouts

Accessibility is required for every feature.

---

# 17. Design Principles

- Component reusability
- Responsive-first design
- Feature isolation
- Minimal prop drilling
- Predictable state
- Consistent UI patterns
- Design system compliance

---

# 18. Locked Decisions

Version 1 frontend decisions:

- Next.js App Router
- JavaScript only
- Tailwind CSS
- shadcn/ui
- React Query
- Axios
- React Hook Form
- Zod
- Recharts

Changes require updating this document.

---

# 19. Future Evolution

Future improvements may include:

- Progressive Web App (PWA)
- Offline support
- Theme customization
- Advanced accessibility tools
- Real-time synchronization
- Micro-frontends

The architecture should support these enhancements without requiring major rewrites.

---

# References

- architecture.md
- backend_architecture.md
- mobile_architecture.md
- docs/ui/design_system.md
- docs/api/api_overview.md

---

> **Architecture Principle:** The frontend is responsible for presentation, user interaction, and API consumption. Business logic must remain in the backend, while the UI remains modular, reusable, accessible, and responsive.