---
title: "Islands Architecture"
---

Astro uses the **Islands** concept — interactive components isolated within static HTML. This minimizes the JavaScript sent to the client.

## Guidelines

### Prefer Astro for Static Content

Components that only display data (lists, grids, headers) **must be Astro**. They generate pure HTML with zero JavaScript.

### Use React Only for Interactivity

Reserve React components for:
- Local state and events (`useState`, `useEffect`)
- Hooks and contexts
- Third-party library integration

### Hydration Strategy

| Directive | When to use | Impact |
|----------|-------------|--------|
| `client:load` | Immediately needed (critical) | Loads JS on initial load |
| `client:visible` | Below the fold (recommended default) | Loads when entering viewport |
| `client:idle` | Non-urgent | Loads when browser is idle |
| `client:media` | Responsive | Loads only at certain breakpoints |
| `client:only` | SPA-like | No SSR, client only |

### Best Practices

```astro
<!-- Bad: React Island for static content -->
<ProductList client:load />   ← Unnecessary JS

<!-- Good: Native Astro, zero JS -->
<ProductList />

<!-- Good: React only when necessary -->
<CartaoAvaliacaoColapsavel client:visible />
<NavDrawer client:load />
<SearchCommand client:idle />
```

## Current State

The project uses mostly static **Astro** components (zero JS on the client). React UI components (Badge, Button, Card, Progress) render in SSR without client hydration.

**Active islands:**

| Component | Path | Directive | Purpose |
|-----------|------|-----------|---------|
| `CartaoAvaliacaoColapsavel` | `src/modules/comunidade/reviews/components/CartaoAvaliacaoColapsavel.tsx` | `client:visible` | Expandable/collapsible user review card |
| `NavDrawer` | `src/core/ui/nav-drawer.tsx` | `client:load` | Mobile navigation drawer |
| `SearchCommand` | `src/core/ui/search-command.tsx` | `client:load` | Search palette (CMD+K) |
| `LoginDialog` | `src/modules/comunidade/auth/components/LoginDialog.tsx` | `client:load` | Login/register modal with tabs |
| `UserMenu` | `src/modules/comunidade/auth/components/UserMenu.tsx` | `client:load` | Authenticated user menu |
| `PainelDashboard` | `src/modules/comunidade/auth/components/PainelDashboard.tsx` | `client:load` | User dashboard panel |
| `ComparadorInteractive` | `src/modules/comparar/components/ComparadorInteractive.tsx` | `client:load` | Interactive product comparison |
| `HeroCarousel` | `src/modules/inicio/components/HeroCarousel.tsx` | `client:load` | Featured products carousel |

> **Rule:** only add `client:*` when state/event handling is unavoidable. Prefer `client:visible` or `client:idle` over `client:load`.

> **Note:** All authentication islands (LoginDialog, UserMenu, PainelDashboard) and reviews (CartaoAvaliacaoColapsavel) are conditionally rendered — they only appear when `COMMUNITY_ENABLED()` returns `true`. See [community.md](./comunidade.md) for details.
