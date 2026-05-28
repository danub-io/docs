---
title: "Security - CTECH Panel"
---

## Overview
This document describes security practices, fixed vulnerabilities, and guidelines for contributors.

## Fixed Vulnerabilities

### SQL Injection (Commit `08881d7` - April 2026)
**Severity:** Critical

**Description:**
The project used string interpolation to build `IN` clauses in SQL queries, allowing SQL injection if parameters were not properly sanitized.

**Vulnerable Code (Before):**
```typescript
// DANGER: Direct interpolation
const ids = [1, 2, 3];
const query = `SELECT * FROM produtos WHERE id IN (${ids.join(',')})`;
await db.execute(query);
```

**Fix (Now):**
```typescript
// SAFE: Parameterized placeholders
const ids = [1, 2, 3];
const placeholders = ids.map(() => '?').join(',');
const query = `SELECT * FROM produtos WHERE id IN (${placeholders})`;
await db.execute({ sql: query, args: ids });
```

**Impact:**
- Affected queries in `src/lib/db.ts`, `src/lib/queue.ts` and repositories
- Mitigated by using `libsql`/`drizzle` placeholders

## Security Practices

### API Key Encryption
API keys for AI providers are stored encrypted in `config_ai_models` and `config_scraping_services`:
- **Algorithm:** AES-256-CBC
- **Key:** Defined in `ENCRYPTION_KEY` in `.env`
- **Implementation:** `src/lib/encryption.ts`

### Input Validation
- All user input must be validated with **Zod** (schemas in each Server Action)
- Server Actions are protected by `use server` and parameter validation
- URL sanitization in `src/lib/scrapers.ts` to prevent SSRF

### Data Access
- **Repository Pattern:** Isolates SQL queries in `src/lib/repositories/`
- **Principle of Least Privilege:** Each Server Action accesses only the necessary data
- **Turso (libsql):** Remote SQLite database with token-secured connections

## Security Checklist for PRs
- [ ] New endpoints/Server Actions have Zod validation
- [ ] SQL queries use placeholders (never interpolation)
- [ ] Keys/Secrets are not committed (use `.env.example`)
- [ ] Encryption of sensitive data at rest
- [ ] Security tests added (`src/app/actions/__tests__/security.test.ts`)

## Reporting Vulnerabilities
To report security vulnerabilities, open an Issue with the `security` label or contact the maintainer team directly.

**Do not** publicly disclose vulnerabilities before a fix is released.
