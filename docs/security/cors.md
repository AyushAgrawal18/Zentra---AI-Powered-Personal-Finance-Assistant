# 🔐 Security: Cross-Origin Resource Sharing (CORS) Configuration

---

title: Cross-Origin Resource Sharing (CORS)

module: security

version: 1.0.0

status: Locked

priority: High

owner: Security Team

related_docs:

- README.md
- authentication.md
- jwt.md
- validation.md
- ../deployment/nginx.md
- ../env/environment.md

---

# Cross-Origin Resource Sharing (CORS)

> This document defines Zentra's Cross-Origin Resource Sharing (CORS) policy. It specifies how browsers are allowed to access backend resources from different origins while preventing unauthorized cross-origin requests.

---

# Table of Contents

1. Purpose
2. Security Goals
3. CORS Overview
4. Allowed Origins
5. Allowed Methods
6. Allowed Headers
7. Credentials
8. Preflight Requests
9. Environment Configuration
10. Error Handling
11. Security Considerations
12. Future Enhancements

---

# 1. Purpose

Modern browsers enforce the Same-Origin Policy (SOP), which prevents web applications from making requests to a different origin unless the server explicitly permits it.

CORS provides a controlled mechanism for allowing legitimate cross-origin communication.

---

# 2. Security Goals

The CORS policy aims to:

- Prevent unauthorized cross-origin requests
- Allow trusted frontend applications
- Protect authenticated endpoints
- Reduce attack surface
- Maintain browser security standards
- Support development and production environments

---

# 3. CORS Overview

Request flow:

```
Browser

↓

Cross-Origin Request

↓

Backend CORS Policy

↓

Origin Validation

↓

Allow / Reject

↓

Response
```

Only approved origins receive CORS headers.

---

# 4. Allowed Origins

Only explicitly trusted origins should be allowed.

Examples:

Development

```
http://localhost:3000
http://localhost:5173
```

Production

```
https://zentra.app
https://app.zentra.app
```

Administrative dashboards may use a separate approved origin if required.

Wildcard (`*`) origins should **never** be used for authenticated production APIs.

---

# 5. Allowed Methods

The API should only expose the HTTP methods required by the application.

Typical methods include:

- GET
- POST
- PUT
- PATCH
- DELETE
- OPTIONS

Unsupported methods should return an appropriate HTTP response.

---

# 6. Allowed Headers

Accepted request headers may include:

- Authorization
- Content-Type
- Accept
- X-Request-ID
- X-Correlation-ID

Only required headers should be allowed.

---

# 7. Credentials

Authenticated requests may include credentials such as cookies or authorization headers.

When credentials are enabled:

- Origins must be explicitly allowed.
- Wildcard origins must not be used.
- Responses should include only the necessary CORS headers.

Credential handling should be consistent with the authentication strategy.

---

# 8. Preflight Requests

Browsers automatically send a preflight request for certain cross-origin operations.

```
Browser

↓

OPTIONS Request

↓

CORS Validation

↓

Access Granted

↓

Actual Request
```

The server should:

- Validate the request origin.
- Validate requested methods.
- Validate requested headers.
- Return the appropriate CORS response.

Preflight requests should not execute business logic.

---

# 9. Environment Configuration

Different environments may use different CORS policies.

## Development

Development environments may allow local frontend origins used by developers.

## Testing

Testing environments should mirror production where practical.

## Production

Production should:

- Allow only trusted domains.
- Reject unknown origins.
- Disable unnecessary development origins.
- Be managed through environment configuration.

Origin lists should not be hard-coded into application logic.

---

# 10. Error Handling

When a request violates the CORS policy:

- The request should not be processed.
- The browser blocks access to the response.
- Server logs may record the rejected origin for operational monitoring.

The server should avoid exposing internal configuration details.

---

# 11. Security Considerations

CORS is **not** an authentication or authorization mechanism.

CORS policy should:

- Restrict allowed origins.
- Limit allowed methods.
- Limit allowed headers.
- Avoid wildcard origins for protected APIs.
- Be reviewed whenever new client applications are introduced.

Other security controls, including authentication, authorization, and validation, remain mandatory.

---

# 12. Future Enhancements

Future versions may include:

- Dynamic origin allowlists
- Per-environment configuration management
- Separate policies for public and administrative applications
- Monitoring of rejected origins
- Automated validation of CORS configuration during deployment

---

# References

- README.md
- authentication.md
- jwt.md
- validation.md
- ../deployment/nginx.md
- ../env/environment.md

---

> **CORS Principle:** Cross-origin access must be explicitly granted only to trusted client applications. CORS improves browser security by restricting unauthorized origins, but it complements rather than replaces authentication, authorization, and other backend security controls.
