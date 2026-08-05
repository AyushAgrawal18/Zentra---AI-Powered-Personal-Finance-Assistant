# 🔐 Security: HTTP Headers & Helmet Middleware Strategy

---

title: HTTP Security Headers (Helmet)

module: security

version: 1.0.0

status: Locked

priority: High

owner: Security Team

related_docs:

- README.md
- cors.md
- validation.md
- owasp.md
- ../deployment/nginx.md
- ../architecture/backend_architecture.md

---

# HTTP Security Headers (Helmet)

> This document defines Zentra's HTTP security header strategy using Helmet. Security headers instruct browsers to enforce additional protections against common web attacks such as XSS, clickjacking, MIME sniffing, insecure transport, and information leakage.

---

# Table of Contents

1. Purpose
2. Security Goals
3. Helmet Overview
4. Security Header Pipeline
5. Content Security Policy (CSP)
6. HTTP Strict Transport Security (HSTS)
7. X-Content-Type-Options
8. X-Frame-Options
9. Referrer Policy
10. Cross-Origin Policies
11. Header Configuration
12. Environment Strategy
13. Security Considerations
14. Future Enhancements

---

# 1. Purpose

Browsers rely on HTTP response headers to determine how content should be handled.

Helmet applies a secure baseline by automatically setting recommended HTTP security headers.

These headers reduce the risk of:

- Cross-Site Scripting (XSS)
- Clickjacking
- MIME sniffing
- Information leakage
- Insecure transport
- Cross-origin attacks

---

# 2. Security Goals

The HTTP security header policy aims to:

- Harden browser behavior
- Reduce client-side attack surface
- Prevent unsafe resource loading
- Enforce HTTPS
- Protect sensitive application data
- Follow modern browser security recommendations

---

# 3. Helmet Overview

Helmet is middleware that configures multiple HTTP security headers for every response.

Request flow:

```
Client

↓

HTTP Request

↓

Express Application

↓

Helmet Middleware

↓

Security Headers Added

↓

Controller

↓

Response
```

Helmet should be initialized early in the middleware pipeline so that all applicable responses receive the configured headers.

---

# 4. Security Header Pipeline

Every response follows this process:

```
Incoming Request

↓

Helmet

↓

Security Headers

↓

Authentication

↓

Authorization

↓

Business Logic

↓

Response
```

Security headers are added regardless of whether the request is public or authenticated.

---

# 5. Content Security Policy (CSP)

Content Security Policy (CSP) restricts the sources from which the browser may load resources.

CSP helps mitigate:

- Cross-Site Scripting (XSS)
- Malicious script injection
- Unauthorized third-party resources

Typical directives include restrictions for:

- Scripts
- Styles
- Images
- Fonts
- Connections
- Frames

Production policies should be restrictive and permit only trusted origins.

---

# 6. HTTP Strict Transport Security (HSTS)

HSTS instructs browsers to communicate with the application using HTTPS.

Benefits include:

- Prevents protocol downgrade attacks
- Reduces SSL stripping attacks
- Encourages secure transport

HSTS should only be enabled after HTTPS has been fully deployed in production.

---

# 7. X-Content-Type-Options

This header instructs browsers not to perform MIME type sniffing.

Benefits:

- Prevents browsers from interpreting files as unexpected content types
- Reduces certain content injection risks

Responses should always specify the correct Content-Type.

---

# 8. X-Frame-Options

This header controls whether application pages may be embedded inside frames.

It helps protect against:

- Clickjacking
- UI redressing attacks

Sensitive pages such as login, dashboard, and account settings should not be embeddable by untrusted sites.

---

# 9. Referrer Policy

The Referrer Policy controls how much referral information browsers send when navigating between pages.

Objectives:

- Minimize information leakage
- Protect sensitive URLs
- Improve user privacy

Policies should be selected according to application requirements and browser compatibility.

---

# 10. Cross-Origin Policies

Helmet can configure additional browser isolation policies.

Examples include:

- Cross-Origin-Embedder-Policy (COEP)
- Cross-Origin-Opener-Policy (COOP)
- Cross-Origin-Resource-Policy (CORP)

These policies improve isolation between documents and resources, reducing exposure to certain cross-origin attacks.

Configuration should be tested to ensure compatibility with third-party integrations.

---

# 11. Header Configuration

Security headers should be:

- Applied globally
- Managed centrally
- Configurable through environment settings where appropriate
- Reviewed whenever new browser-facing functionality is introduced

Headers should not conflict with application features such as file downloads, embedded content, or trusted third-party integrations.

---

# 12. Environment Strategy

## Development

Development environments may temporarily relax certain policies to support debugging and local tooling.

## Staging

Staging should closely mirror production header configuration.

## Production

Production should:

- Enforce HTTPS
- Enable HSTS
- Use a restrictive CSP
- Apply all recommended Helmet protections
- Disable unnecessary browser features

---

# 13. Security Considerations

Helmet improves browser security but is only one layer of defense.

Additional protections remain necessary:

- Authentication
- Authorization
- Input Validation
- Output Encoding
- Secure Cookies
- HTTPS
- Rate Limiting

Security headers should be verified during testing and after deployment.

---

# 14. Future Enhancements

Future releases may include:

- CSP violation reporting
- Automated security header validation
- Per-route CSP policies
- Trusted Types
- Browser feature permissions review
- Continuous header monitoring

---

# References

- README.md
- cors.md
- validation.md
- owasp.md
- ../deployment/nginx.md
- ../architecture/backend_architecture.md

---

> **Helmet Principle:** Every HTTP response should include a consistent set of security headers that harden browser behavior, reduce exposure to common web attacks, and complement server-side security controls. Browser protections are an additional defense layer—not a substitute for secure application design.
