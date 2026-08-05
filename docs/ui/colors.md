---
title: Color System

module: ui

version: 1.0.0

status: Locked

priority: Critical

owner: Design Team

related_docs:
  - README.md
  - design_system.md
  - typography.md
  - spacing.md
  - components.md
  - pages.md
---

# Color System

> This document defines Zentra's complete color system. It establishes the brand palette, semantic colors, neutral scale, accessibility requirements, and usage guidelines to ensure a consistent, accessible, and recognizable visual identity across all interfaces.

---

# Table of Contents

1. Purpose
2. Objectives
3. Design Philosophy
4. Brand Colors
5. Neutral Palette
6. Semantic Colors
7. Financial Colors
8. Background Colors
9. Text Colors
10. Border Colors
11. Gradients
12. Dark & Light Themes
13. Accessibility
14. Usage Guidelines
15. Best Practices
16. Future Enhancements

---

# 1. Purpose

Colors communicate meaning, hierarchy, status, and brand identity.

The color system aims to:

- Maintain visual consistency
- Improve readability
- Support accessibility
- Reinforce branding
- Reduce design ambiguity
- Enable scalable theming

All interfaces should use predefined design tokens rather than arbitrary colors.

---

# 2. Objectives

The color system should:

- Define reusable color tokens
- Support semantic feedback
- Ensure WCAG-compliant contrast
- Provide consistent branding
- Support future themes
- Simplify UI development

---

# 3. Design Philosophy

Zentra uses a modern, finance-focused visual language.

The palette emphasizes:

- Trust
- Clarity
- Simplicity
- Professionalism
- Financial readability

Color should communicate meaning rather than decoration.

---

# 4. Brand Colors

Representative brand tokens:

| Token     | Purpose                         |
| --------- | ------------------------------- |
| Primary   | Brand identity, primary actions |
| Secondary | Supporting actions              |
| Accent    | Highlights and emphasis         |

Brand colors should remain consistent across marketing and product experiences.

---

# 5. Neutral Palette

Neutral colors provide structure without distracting from content.

Representative tokens:

- Surface
- Background
- Card
- Divider
- Border
- Disabled
- Overlay

Neutrals should form the majority of the interface.

---

# 6. Semantic Colors

Semantic colors communicate application state.

| Semantic    | Purpose                                 |
| ----------- | --------------------------------------- |
| Success     | Successful operations                   |
| Warning     | User attention required                 |
| Error       | Validation failures and critical issues |
| Information | Informational messages                  |

Semantic meaning should remain consistent throughout the application.

---

# 7. Financial Colors

Financial applications require consistent interpretation of gains and losses.

Representative usage:

| State      | Meaning                       |
| ---------- | ----------------------------- |
| Income     | Positive financial activity   |
| Expense    | Negative financial activity   |
| Savings    | Progress toward goals         |
| Investment | Portfolio-related information |

Financial colors should not rely solely on color to communicate meaning; icons or labels should reinforce interpretation.

---

# 8. Background Colors

Representative background layers include:

- Page background
- Section background
- Card background
- Modal background
- Hover background
- Selected background

Background colors should preserve visual hierarchy while maintaining readability.

---

# 9. Text Colors

Representative text tokens:

- Primary text
- Secondary text
- Muted text
- Disabled text
- Inverse text
- Link text

Text colors should maintain sufficient contrast against their backgrounds.

---

# 10. Border Colors

Border tokens should include:

- Default border
- Focus border
- Error border
- Success border
- Divider

Borders should provide subtle separation without creating unnecessary visual noise.

---

# 11. Gradients

Gradients should be used sparingly.

Representative use cases:

- Hero sections
- Marketing pages
- Charts
- Decorative highlights

Core application workflows should primarily rely on solid colors for clarity and accessibility.

---

# 12. Dark & Light Themes

The design system should support multiple themes.

Each theme should define tokens for:

- Backgrounds
- Text
- Borders
- Cards
- Semantic colors
- Interactive elements

Components should reference semantic tokens rather than hardcoded values to simplify theme switching.

---

# 13. Accessibility

Color usage should comply with accessibility standards.

Requirements include:

- WCAG-compliant contrast ratios
- Visible focus indicators
- Distinguishable interactive states
- Meaning not conveyed by color alone
- Readable text across all supported themes

Accessibility should be verified whenever new color tokens are introduced.

---

# 14. Usage Guidelines

Recommended usage:

- Use semantic colors for application state.
- Reserve brand colors for primary interactions.
- Use neutral colors for layout and structure.
- Apply consistent emphasis throughout the interface.
- Minimize decorative color usage.

Color selection should always reinforce usability.

---

# 15. Best Practices

Recommended practices include:

- Use design tokens instead of raw color values.
- Maintain sufficient contrast.
- Reuse semantic colors consistently.
- Limit the number of accent colors.
- Test colors across supported themes.
- Review accessibility regularly.
- Keep branding consistent.

A restrained color palette improves clarity and maintainability.

---

# 16. Future Enhancements

Potential improvements include:

- Automated contrast validation
- Dynamic theme generation
- User-selectable themes
- High-contrast accessibility mode
- Brand customization
- Seasonal themes
- Design token synchronization

---

# References

- README.md
- design_system.md
- typography.md
- spacing.md
- components.md
- pages.md

---

> **Color System Principle:** Colors are a foundational part of Zentra's design language. By defining reusable semantic tokens, maintaining strong accessibility standards, and separating branding from functional meaning, the color system enables consistent, scalable, and user-friendly interfaces across every platform.
