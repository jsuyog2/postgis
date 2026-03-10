# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.2.x   | ✅ Yes              |
| < 1.2   | ❌ No               |

## Reporting a Vulnerability

**Please do NOT report security vulnerabilities through public GitHub issues.**

Instead, use [GitHub Security Advisories](https://github.com/jsuyog2/postgis/security/advisories/new)
to report a vulnerability privately.

You can expect:

- **Acknowledgment** within 48 hours
- **Status update** within 7 days
- A **fix and public advisory** as soon as possible after the fix is ready

## Security Considerations

> [!WARNING]
> This library builds SQL queries using **template literals**. Table names, column
> names, and filter strings are interpolated directly into SQL — they are **not**
> parameterized. Callers are responsible for sanitizing any user-controlled values
> before passing them to this library. Never pass raw user input directly as
> a `table`, `filter`, or `columns` argument.
