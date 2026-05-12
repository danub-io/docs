---
title: "Postmortem 006: React Hooks Error in SSR (Vite + Cloudflare Workerd)"
---

## Summary

- **Date:** 2026-05-09
- **Components:** `HeroCarousel`, `NavDrawer`, `SearchCommand`, `LoginDialog`
- **Symptom:** `Invalid hook call` and `TypeError: Cannot read properties of null (reading 'useState')` during SSR in the development environment. There were also `file not found` errors for chunks in the `.cache/vite/deps_ssr` directory.
- **Severity:** High — prevented any page with hydrated React components (`client:load`) from loading.
- **Root cause:** Cascading dependency discovery by Vite. As the SSR server encountered new dependencies (such as `@base-ui/react/*`), it triggered re-optimizations and reloads of the `workerd` runtime (Cloudflare), causing multiple React instances to coexist and breaking the hooks singleton.

## Timeline

1. User tried to start the development server (`pnpm run dev`).
2. The server started, but when loading the home page, Vite began optimizing dependencies one by one (`@libsql/client`, `@base-ui/react/drawer`, `lucide-react`, etc.).
3. Each optimization triggered a program reload (`[vite] program reload`).
4. During one of the reloads, the runtime failed to find a specific chunk (`chunk-AGMJKLV5.js`) in the cache.
5. After the file-not-found error, `Invalid hook call` errors started appearing in all React components in the navbar and hero.
6. Investigation revealed that the SSR environment was loading duplicate or corrupted React instances due to Vite's multiple simultaneous reloads.

## Root Cause

By default, Vite discovers and optimizes dependencies as they are encountered in the code during development. In Astro projects using the `@astrojs/cloudflare` adapter and the `workerd` runtime, each newly discovered dependency causes a full reload of the worker execution environment.

On a page with many React components (`HeroCarousel`, `NavDrawer`, `SearchCommand`, `LoginDialog`), this process cascades. The rapid successive reloading of `workerd` leads to:

1. **Cache invalidation:** Chunks generated in the previous round are deleted/overwritten while the worker is still trying to read them.
2. **Instance duplication:** React relies on an internal singleton to manage hooks. If Vite does not pre-bundle React correctly or if there are disordered reloads, the worker ends up loading more than one copy of React, resulting in the hooks error.

## Solution

1. **Cache Cleanup:** Forced removal of the `.cache/vite` directory to ensure a clean state.
2. **Full Pre-optimization:** Configuration of `optimizeDeps.include` in `astro.config.mjs` to include all major project libraries.

```javascript
// astro.config.mjs
vite: {
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      '@base-ui/react/drawer',
      '@base-ui/react/collapsible',
      'embla-carousel-react',
      // ... other UI deps
    ],
  },
}
```

This forces Vite to optimize all these libraries at once on startup, avoiding late discoveries in the middle of SSR and ensuring only one React instance is shared across all modules.

## Files Changed

- `astro.config.mjs` — added `optimizeDeps.include` with the exhaustive list of UI dependencies.

## Lessons Learned

1. The Cloudflare `workerd` runtime is more sensitive to partial Vite reloads than the traditional Node.js environment.
2. In Astro + Cloudflare + React 19 projects, dependency pre-optimization (`optimizeDeps.include`) is not optional; it is required for development environment stability.
3. If the console starts showing many `✨ new dependencies optimized` messages, it is a sign that the configuration file needs to be updated to avoid an imminent cascading crash.

## Preventive Actions

- When adding new React component libraries (e.g., `framer-motion`, `radix-ui`), immediately add them to `optimizeDeps.include` in `astro.config.mjs`.
- Keep an eye on the `pnpm dev` command; if there are excessive reloads at startup, review the list of included dependencies.
