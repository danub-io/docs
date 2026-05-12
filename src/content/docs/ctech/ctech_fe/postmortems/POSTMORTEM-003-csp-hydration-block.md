---
title: "Postmortem 003: CSP blocking React component hydration"
---

## Summary

- **Date:** 2026-05-07
- **Component:** `src/middleware.ts` (CSP headers)
- **Symptom:** All React components with `client:load` failed silently — SSR HTML rendered but nothing was interactive
- **Severity:** Critical — Affected **all** React islands on the frontend
- **Root cause:** `script-src 'self'` in the middleware blocked the inline scripts that Astro uses for island hydration

## Timeline

1. The hamburger menu (NavDrawer) stopped responding to clicks
2. Initial debugging focused on the component: controlled state, events, floating-ui
3. NavDrawer code was extensively analyzed and modified (controlled state, `nativeButton={false}`, etc.)
4. Unit tests passed — 5/5 in nav-drawer, 399/399 total
5. Written E2E tests confirmed: the drawer did not open
6. Investigated the internal `@base-ui/react/drawer` code (DrawerRoot, DialogTrigger, FloatingRootStore, etc.) for event chaining failures
7. E2E test with console capture revealed: **CSP errors blocking inline scripts**
8. Root cause identified: `script-src 'self'` in the middleware

## Symptoms

- React components with `client:load` render the initial HTML (SSR) perfectly
- No JavaScript events fire — clicks produce no response
- No errors in the server terminal (`pnpm dev`)
- No errors during build (`pnpm build`)
- All 399 unit tests pass
- Silent error in the browser console:
  ```
  Executing inline script violates the following Content Security Policy
  directive 'script-src 'self''. Either the 'unsafe-inline' keyword, a
  hash, or a nonce is required to enable inline execution. The action
  has been blocked.
  ```

## Root Cause

The CSP in `src/middleware.ts` set `script-src 'self'`, which blocks **all inline scripts**. Astro relies on inline scripts for the island hydration system (`<astro-island>`):

```html
<script>
  (self.Astro || (self.Astro = {})).load = async (fn) => { await (await fn())() };
  window.dispatchEvent(new Event('astro:load'));
</script>
```

**Failure chain:**

1. Browser loads page with SSR HTML
2. CSP blocks the inline script that defines `Astro.load`
3. CSP blocks the inline script that fires `astro:load`
4. `<astro-island client="load">` calls `start()`:
   - Checks `Astro['load']` → `undefined`
   - Registers listener for `astro:load` event → never arrives
   - Island stays in **permanent waiting**
5. React component never hydrates
6. No event handler is attached to the DOM
7. Button clicks produce no effect

**This affects ALL islands with `client:load`, `client:idle`, or `client:visible`.**

## Why It Was So Hard to Find

| Reason | Explanation |
|-------|-----------|
| **Silent build** | `astro build` does not validate CSP — compiles without warnings |
| **Silent dev server** | `astro dev` does not show CSP errors in the terminal |
| **Tests bypass middleware** | Vitest + jsdom do not go through Astro middleware — CSP is never applied |
| **Intact SSR** | HTML generates perfectly — page looks visually complete |
| **Debug focused on wrong component** | NavDrawer really had issues (missing controlled state, `nativeButton`), so debugging felt on the right track — but the real problem was elsewhere |
| **CSP is silent by design** | CSP errors appear **only** in the browser console, with no JavaScript exception |
| **Tests mislead** | `userEvent.click()` passes in tests because jsdom does not enforce CSP |

## Applied Fix

**File:** `src/middleware.ts` (line 180)

```diff
- "script-src 'self'",
+ "script-src 'self' 'unsafe-inline'",
```

## Verification

```bash
# 1. Verify CSP header
curl -I http://localhost:4321 | grep content-security-policy
# Should contain: script-src 'self' 'unsafe-inline'

# 2. Check browser console
# No CSP errors related to scripts

# 3. E2E test
pnpm test:e2e -- --grep "NavDrawer"
# Should pass: drawer opens and closes
```

## Lessons Learned

### 1. Browser console is the first source of truth

Whenever a React component with `client:*` renders but does not interact, the **first step is to open the browser console** and look for CSP errors, network errors, or hydration errors. This would have saved hours.

### 2. E2E tests with console capture are essential

E2E tests should always capture `console.error` and `pageerror`:

```typescript
test('should hydrate without errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(err.message));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  await page.goto('/');
  expect(errors).toHaveLength(0);
});
```

### 3. CSP should be tested on all routes

Add an E2E test that verifies CSP allows island hydration. The project already has `tests/e2e/csp-server-defer.spec.ts`.

### 4. Astro inline scripts are a requirement, not an option

Astro SSR generates inline scripts to:
- Define `Astro.load`, `Astro.idle`, etc.
- Fire events `astro:load`, `astro:idle`
- Initialize the island system

Without `'unsafe-inline'` (or nonce), **no hydration happens**.

## Files Changed

- `src/middleware.ts` — added `'unsafe-inline'` to `script-src` in the CSP

## Preventive Actions

- [ ] E2E test checks browser console after page load
- [ ] E2E test verifies island hydrated (button + click + check content)
- [ ] CSP manually tested with `curl -I` on all routes
- [ ] CSP changes are reviewed by another developer
- [ ] CSP errors are monitored (Reporting API with `report-uri`)
