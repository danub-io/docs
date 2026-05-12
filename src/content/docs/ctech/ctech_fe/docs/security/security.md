---
title: "Security — CTECH Frontend"
---

This document describes the security measures implemented in the frontend.

## Content Security Policy (CSP)

Defined in the middleware (`src/middleware.ts`). Current simplified policy (Astro requires `unsafe-inline` for SSR styles):

```
default-src 'self';
script-src 'self' 'unsafe-inline';
style-src 'self' 'unsafe-inline';
img-src 'self' blob: data: https://*;
connect-src 'self' https://*;
frame-ancestors 'none';
```

> **Note:** `unsafe-inline` in scripts is required for Astro (inline script injection in SSR). `https://*` in images/connections accepts any HTTPS source (flexibility for affiliates and CDNs).

### How to modify

Edit `src/middleware.ts` and test:

```bash
curl -I http://localhost:4321 | grep content-security-policy
```

## HTTP Security Headers

| Header | Value | Effect |
|--------|-------|--------|
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` | Forces HTTPS for 2 years with preload |
| `X-Frame-Options` | `DENY` | Protects against clickjacking |
| `X-Content-Type-Options` | `nosniff` | Prevents MIME sniffing |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Controls referrer header |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=(), interest-cohort=()` | Disables sensitive APIs and FLoC |

Configured in the Astro middleware (`src/middleware.ts`).

## SQL Injection Protection

The Turso database is accessed **only in SSR** (never on the client). All queries use parameterized placeholders:

```typescript
// Correct (parameterized)
await db.execute({
  sql: 'SELECT * FROM Produtos WHERE slug = ?',
  args: [slug],
});

// Wrong (never do this)
await db.execute(`SELECT * FROM Produtos WHERE slug = '${slug}'`);
```

## Database Access

- Turso client (`libsql`) imported only in `.astro` files (frontmatter) and SSR services
- No endpoint exposes the client to the browser
- Turso authentication token is configured via env var and marked as secret

## Development Practices

1. **Never** expose `TURSO_AUTH_TOKEN` in logs or error messages
2. **Never** import `src/core/lib/db.ts` in React components (Astro SSR only)
3. **Validate inputs:** Use Zod (`safeParse`) for database data and query params
4. **Sanitize outputs:** Astro auto-escapes in templates (`{var}`)
5. **Rate limiting:** Consider adding on search routes and on the conditional community module routes (`/api/auth/*`, `/api/reviews/*`) if abuse is detected

## PR Checklist

- [ ] CSP updated if a new CDN/external source was added
- [ ] SQL queries use placeholders (`?` + `args`)
- [ ] No credentials or tokens in logs or errors
- [ ] React component does not import `db` directly

## Protected Routes

The following routes are conditionally protected by the `COMMUNITY_ENABLED` feature flag:

| Route | Behavior (disabled) |
|-------|---------------------|
| `/community` | Returns 404 |
| `/dashboard` | Returns 404 |
| `/api/auth/*` | Returns 404 |
| `/api/reviews/*` | Returns 404 |
| `/user-reviews` | Returns 404 |

> The middleware checks `COMMUNITY_ENABLED()` before loading `currentUser`. When disabled, no community routes are accessible regardless of authentication.

## Troubleshooting: CSP blocking Astro component hydration

### History

In May 2026, the hamburger menu (NavDrawer) stopped responding to clicks. The
button rendered in SSR, but nothing happened when clicked. It took several
hours of debugging to identify the root cause.

### Symptom

- React components with `client:load` render the initial HTML (SSR) correctly
- No JavaScript events fire when interacting with the components
- No errors in the server console or build output
- Browser console error:
  ```
  Executing inline script violates the following Content Security Policy
  directive 'script-src 'self''. Either the 'unsafe-inline' keyword, a
  hash, or a nonce is required to enable inline execution.
  ```

### Root Cause

The CSP in `src/middleware.ts` used `script-src 'self'`, which blocks **all
inline scripts**. Astro depends on inline scripts for its island hydration
system (`<astro-island>`):

```html
<script>
  (self.Astro || (self.Astro = {})).load = async (fn) => { await (await fn())() };
  window.dispatchEvent(new Event('astro:load'));
</script>
```

When this script is blocked:

1. `Astro.load` is never defined
2. The `astro:load` event is never dispatched
3. `<astro-island client="load">` islands remain in a permanent waiting state
4. React components never hydrate
5. Event handlers are never attached to the DOM

This affects **all** React components with `client:load` or `client:idle`.

### Why it was hard to find

1. **Build and server with no errors:** `pnpm build` and `pnpm dev` run without
   any errors or warnings related to CSP.
2. **Unit tests pass:** Vitest + jsdom tests do not go through the Astro
   middleware, so CSP is never applied.
3. **SSR works:** HTML is generated perfectly on the server — the page
   looks complete.
4. **Silent CSP:** CSP errors only appear in the browser console, not in the
   server terminal.
5. **Isolated tests mislead:** Unit tests with `userEvent.click()` pass because
   there is no CSP in the test environment.

### Lesson Learned

**Always check the browser console** when a React component with `client:*`
renders but does not react to interactions. CSP errors are the fastest
diagnostic.

### Fix

Add `'unsafe-inline'` to the `script-src` directive in the middleware:

```diff
- "script-src 'self'",
+ "script-src 'self' 'unsafe-inline'",
```

### Verification

After the fix, the browser console should show no CSP errors for scripts. Test with:

```bash
curl -I http://localhost:4321 | grep content-security-policy
```

The response must contain `'unsafe-inline'` in `script-src`.

### Safer alternatives

If further restriction of inline scripts is needed, use **nonces**:

1. Generate a cryptographic nonce in the middleware
2. Store it in `context.locals.nonce`
3. Include `'nonce-{nonce}'` in the CSP
4. Pass the nonce to the Astro layout via `Astro.locals.nonce`

Astro supports nonces for its generated inline scripts. See the
[official Astro documentation on
nonce](https://docs.astro.build/en/guides/content-security-policy/).
