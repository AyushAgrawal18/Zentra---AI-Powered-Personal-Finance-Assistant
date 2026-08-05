---
title: Mobile Architecture

module: architecture

version: 1.0.0

status: Locked

priority: Critical

owner: Mobile Team

related_docs:
  - architecture.md
  - backend_architecture.md
  - frontend_architecture.md
  - api/api_overview.md
  - ui/design_system.md
---

# Mobile Architecture

> This document defines the architecture of the Zentra Flutter application, including project structure, navigation, state management, API communication, local storage, notifications, and synchronization.

---

# Table of Contents

1. Purpose
2. Architectural Goals
3. Non Goals
4. Mobile Overview
5. Technology Stack
6. Folder Structure
7. Application Layers
8. Navigation
9. State Management
10. API Communication
11. Local Storage
12. Synchronization Strategy
13. Notifications
14. Security
15. Performance
16. Offline Strategy
17. Design Principles
18. Locked Decisions
19. Future Evolution

---

# 1. Purpose

This document defines how the Zentra Flutter application is organized.

It establishes:

- Project structure
- Navigation
- State management
- API communication
- Local persistence
- Synchronization
- Security

The mobile application should remain consistent with the web application while following Flutter best practices.

---

# 2. Architectural Goals

The mobile architecture should provide:

- Modular development
- High performance
- Responsive UI
- Reusable widgets
- Reliable synchronization
- Secure authentication
- Consistent user experience
- Easy maintenance

---

# 3. Non Goals

Version 1 intentionally excludes:

- Offline transaction editing
- Local database synchronization
- Multi-device collaboration
- Background financial processing
- Plugin architecture

These may be introduced in future releases.

---

# 4. Mobile Overview

The mobile application is built using Flutter.

Responsibilities include:

- Native mobile experience
- API communication
- Authentication
- Local preference storage
- Push notification support (future)
- Deep link handling

Business logic remains in the backend.

---

# 5. Technology Stack

Framework

- Flutter

Language

- Dart

State Management

- Riverpod

Navigation

- GoRouter

Networking

- Dio

Serialization

- json_serializable

Secure Storage

- flutter_secure_storage

Local Storage

- SharedPreferences

Image Handling

- image_picker

Charts

- fl_chart

---

# 6. Folder Structure

```
lib/

├── core/
├── features/
├── shared/
├── providers/
├── services/
├── models/
├── routes/
├── widgets/
├── utils/
└── main.dart
```

Every business feature lives inside the `features/` directory.

---

# 7. Application Layers

```
Screens

↓

Feature Widgets

↓

Providers

↓

Services

↓

REST API
```

Each layer should have a single responsibility.

---

# 8. Navigation

Navigation is managed using GoRouter.

Example routes:

```
/

login

register

dashboard

transactions

budgets

goals

analytics

payments

profile

settings
```

Protected routes require authentication.

---

# 9. State Management

The application uses Riverpod.

State categories include:

## Server State

Examples:

- Transactions
- Budgets
- Goals
- Dashboard
- Analytics

---

## Local UI State

Examples:

- Selected tab
- Bottom sheets
- Search query
- Filters

---

## Persistent Preferences

Examples:

- Theme
- Language
- Currency
- Notification preferences

---

# 10. API Communication

All API communication follows:

```
Flutter UI

↓

Riverpod

↓

Service Layer

↓

Dio Client

↓

REST API
```

Rules:

- No direct HTTP calls from UI.
- Use centralized API client.
- Attach authentication automatically.
- Standardize error handling.

---

# 11. Local Storage

Version 1 stores only lightweight data locally.

Examples:

- Theme
- Language
- Login session
- User preferences

Financial records remain on the server.

---

# 12. Synchronization Strategy

Synchronization occurs:

- After login
- On pull-to-refresh
- After successful mutations
- When the app returns to the foreground

Conflict resolution remains the responsibility of the backend.

---

# 13. Notifications

Version 1

- In-app notification support

Future

- Firebase Cloud Messaging
- Push notifications
- Scheduled reminders

Notification handling should remain independent from business modules.

---

# 14. Security

The mobile application enforces:

- Secure token storage
- HTTPS only
- Authentication before protected routes
- Secure logout
- Sensitive data masking
- Certificate pinning (future)

Sensitive information must never be stored in plain text.

---

# 15. Performance

Performance strategies include:

- Lazy widget building
- Efficient list rendering
- Image caching
- API response caching
- Pagination
- Minimal widget rebuilds

---

# 16. Offline Strategy

Version 1 supports limited offline capability.

Available offline:

- Theme
- Preferences
- Cached user profile

Unavailable offline:

- Transactions
- Payments
- Analytics
- AI Chat
- AI Insights

Users should receive clear feedback when internet connectivity is required.

---

# 17. Design Principles

- Feature-based architecture
- Reusable widgets
- Separation of concerns
- Responsive layouts
- Consistent navigation
- Minimal state duplication
- Backend as the source of truth

---

# 18. Locked Decisions

Version 1 mobile decisions:

- Flutter
- Dart
- Riverpod
- GoRouter
- Dio
- REST APIs
- flutter_secure_storage
- SharedPreferences

Changes require updating this document.

---

# 19. Future Evolution

Future improvements may include:

- Offline-first architecture
- Local database (Drift/Isar)
- Background synchronization
- Push notifications
- Biometric authentication
- Wearable device support
- Home screen widgets

The architecture should support these enhancements without major structural changes.

---

# References

- architecture.md
- backend_architecture.md
- frontend_architecture.md
- docs/api/api_overview.md
- docs/ui/design_system.md

---

> **Architecture Principle:** The Flutter application is a lightweight client responsible for delivering a fast, secure, and native user experience. Business rules and financial calculations remain on the backend, while the mobile app focuses on presentation, synchronization, and user interaction.