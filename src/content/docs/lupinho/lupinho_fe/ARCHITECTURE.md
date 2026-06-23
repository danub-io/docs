---
title: 'Architecture — LUPINHO Frontend'
---

This document details the architectural decisions, data flow, and development patterns for the frontend.

## Modular Design and Vibecoding

The project is structured to keep cognitive load low for AI-assisted development, with clear isolation between modules.

### Directory Structure

```
src/
├── core/                        # System infrastructure and foundation
│   ├── ui/                      # ShadCN components (button, card, badge, etc.)
│   │   └── reviews/             # PressCard, CollapsibleReviewCard
│   ├── layouts/                 # Layout, Navbar, Footer
│   ├── lib/                     # DB connection, cache, logger, utilities (cn, scoreColor)
│   ├── services/                # Global cached services (servicoCatalogo, servicoMenu)
│   ├── styles/                  # Global CSS and design tokens (Tailwind v4)
│   └── types/                   # Zod schemas and TypeScript types (product, review, guide)
│
├── modules/                     # Isolated feature domains
│   ├── inicio/                  # Home page (Hero, Categories, Trends)
│   ├── produto/                 # Product detail pages
│   ├── categoria/               # Category pages with label grouping
│   ├── guia/                    # Editorial recommendation guides
│   ├── comparar/                # Product comparison engine
│   ├── comunidade/              # Community module (auth, feed, reviews)
│   │   ├── auth/                # Authentication (services, components, schemas)
│   │   ├── feed/                # Community review feed
│   │   └── reviews/             # User review components
│   ├── busca/                   # Full-text search
│   └── rolagem_horizontal/      # Horizontal carousel components
│
├── pages/                       # Routing layer (Astro)
│   ├── index.astro              # Home
│   ├── [categoria]/[slug]       # Individual product
│   ├── [categoria]/             # Category listing
│   ├── guia/[slug].astro        # Individual guide
│   ├── painel.astro             # User dashboard
│   └── api/auth/                # Authentication endpoints
```

### Vibecoding Methodology

1. **Scope Isolation:** Only provide the relevant module context to the AI
2. **Local Modifications:** Avoid changing `@core/*` unless strictly necessary
3. **Clear Contracts:** Components in `@modules` receive data via props handled at the page level

## Data Flow

```
Turso DB (libsql) ← lupinho_be (writes)
    ↑↓ SSR queries (parameterized with ? placeholders)
    ↓
Services (try/catch → safeParse Zod)
    ↓
Astro Pages (SSR calls in frontmatter)
    ↓
Astro/React Components (props → render)
```

- **Server-Side Rendering:** All data is fetched in Astro page frontmatter
- **Never on the client:** The database is not accessed in the browser
- **Components with `server:defer`** can fetch their own data (e.g., Trends, WhereToBuy)
- **Error handling:** Services return `[]` or `null` on failure
- **Aggregate function:** `servicoProduto.obterProdutoCompleto()` parallelizes 3 queries (product + press reviews + affiliates)

## In-Memory Cache

Stampede-protected cache (Map-based TTL + shared `pendingFetch`):

| Service           | Method                                               | TTL    |
| ----------------- | ---------------------------------------------------- | ------ |
| `servicoCatalogo` | `obterCategorias()`                                  | 5 min  |
| `servicoMenu`     | `obterMenu()`                                        | 5 min  |
| `servicoProduto`  | `obterTodosSlugs()`                                  | 1h     |
| `servicoGuia`     | `obterCategoriasComGuias()`                          | 30 min |
| `servicoInicio`   | `obterProdutosDestaque()`, `obterProdutosRecentes()` | 2 min  |

Cache is invalidated only on server restart.

## Services

Each domain has a service that encapsulates SQL queries and transformations.

### Core Services

| Service           | File                                   | Functions           |
| ----------------- | -------------------------------------- | ------------------- |
| `servicoCatalogo` | `src/core/services/servicoCatalogo.ts` | `obterCategorias()` |
| `servicoMenu`     | `src/core/services/servicoMenu.ts`     | `obterMenu()`       |

### Module Services

| Module    | Service                                       | Functions                                                                                                                                            |
| --------- | --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Home      | `servicoInicio`                               | `obterProdutosDestaque()`, `obterProdutosRecentes()`                                                                                                 |
| Product   | `servicoProduto`                              | `obterProdutoPorSlug()`, `obterTodosSlugs()`, `obterAvaliacoesCriticas()`, `obterAvaliacoesUsuarios()`, `obterAfiliados()`, `obterProdutoCompleto()` |
| Category  | `servicoCategoria` + `servicoSecoesCategoria` | `obterProdutosPorCategoria()`, `obterSecoes()`                                                                                                       |
| Guide     | `servicoGuia`                                 | `obterGuiasPorCategoria()`, `obterGuiaPorSlug()`, `obterProdutosDoGuia()`                                                                            |
| Search    | `servicoBusca`                                | `buscar()`                                                                                                                                           |
| Compare   | `servicoComparacao`                           | `obterProdutosComparacao()`, `obterTopProdutos()`, `obterSugestoesBusca()`                                                                           |
| Community | `servicoComunidade`                           | `obterAvaliacoesRecentes()`                                                                                                                          |
| Auth      | `servicoAuth`                                 | `verificarToken()`, `buscarUsuarioPorId()`, `usuarioParaPublico()`                                                                                   |

## Islands Architecture

The project uses Astro Islands — interactive React components embedded in static HTML:

| Type                  | Usage                                | Hydration                         |
| --------------------- | ------------------------------------ | --------------------------------- |
| **Native Astro**      | Layouts, pages, lists                | Zero JS on client                 |
| **React Island**      | ScoreBadge, CollapsibleReviewCard    | `client:visible` or `client:idle` |
| **Interactive React** | LoginDialog, UserMenu, SearchCommand | `client:load` / `client:idle`     |

### Selection Criteria

- Prefer **Astro** for presentation components
- Use **React** only when state, events, or hooks are needed
- Prefer `client:visible` over `client:load` for performance

## Types and Validation (Zod v4)

| Schema          | File                        | Usage                  |
| --------------- | --------------------------- | ---------------------- |
| `ProductSchema` | `src/core/types/product.ts` | Product validation     |
| `ReviewSchema`  | `src/core/types/review.ts`  | Press and user reviews |
| `GuideSchema`   | `src/core/types/guide.ts`   | Recommendation guides  |
| `LabelSchema`   | `src/core/types/label.ts`   | Category labels        |

## CSS Strategy (Tailwind v4)

- **Mobile First:** Base classes = mobile. `md:`, `lg:` for breakpoints
- **Design Tokens:** Colors and typography defined in `src/core/styles/global.css`
- **Components:** Prefer composing Tailwind classes over standalone CSS
- **cn() utility:** Use `cn()` for conditional class merging

### Layout Tokens

| Token                     | Value  | Usage                    |
| ------------------------- | ------ | ------------------------ |
| `--spacing-container-max` | 1280px | Max container width      |
| `--spacing-gutter`        | 24px   | Gap between grid items   |
| `--spacing-section-gap`   | 32px   | Spacing between sections |
| `--spacing-box-padding`   | 24px   | Card inner padding       |

### Typography Tokens

| Token            | Value            | Usage                                         |
| ---------------- | ---------------- | --------------------------------------------- |
| `--font-heading` | 'Inter Variable' | Headings (display, page-title, section-title) |
| `--font-body`    | 'Inter Variable' | Body text                                     |
| `--font-display` | 'Inter Variable' | Uppercase sections (section-title)            |
| `--font-sans`    | 'Inter Variable' | General UI (nav, meta, labels)                |

### Typography Utilities

14 `type-*` utility classes in `src/core/styles/global.css`, inspired by the RTINGS.com typography system:

| Class                | Usage                     | Font        | Size    | Weight   |
| -------------------- | ------------------------- | ----------- | ------- | -------- |
| `type-display`       | Hero title on home        | heading     | 4xl/5xl | medium   |
| `type-page-title`    | Page title                | heading     | 2xl/4xl | medium   |
| `type-section-title` | Section title (uppercase) | display     | xl      | normal   |
| `type-subsection`    | Section subtitle          | heading     | xl      | medium   |
| `type-card-title`    | Card title                | heading     | base    | semibold |
| `type-body`          | Body text                 | (inherited) | base    | normal   |
| `type-body-sm`       | Small body                | (inherited) | sm      | normal   |
| `type-body-lg`       | Large body                | (inherited) | lg      | normal   |
| `type-meta`          | UI metadata               | sans        | xs      | medium   |
| `type-caption`       | Captions                  | sans        | xs      | normal   |
| `type-overline`      | Overline label            | sans        | 10px    | bold     |
| `type-micro`         | Micro label               | sans        | 10px    | bold     |
| `type-card-meta`     | Card metadata             | sans        | 11px    | normal   |
| `type-nav-link`      | Navigation links          | sans        | sm      | normal   |
| `type-view-all`      | "View all" link           | sans        | xs      | medium   |

> ShadCN UI components now declare `font-sans` explicitly instead of inheriting from `html`.

## Authentication

Module at `src/modules/comunidade/auth/`:

- `services/servicoAuth.ts` — Registration, login, 2FA verification (JWT with jose, bcryptjs, otplib)
- `services/servicoRateLimit.ts` — Rate limiting (in-memory in dev, D1 in prod)
- `services/servicoCriptografia.ts` — Password hashing, JWT, 2FA

### Security Middleware

The middleware (`src/middleware.ts`) applies:

- JWT token verification on all routes (non-assets)
- Rate limiting on `/api/auth/*` routes (5 req/min login, 3 req/min 2FA, 10 req/h register)
- Security headers: CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy

### CSP policy includes `'unsafe-inline'`

The middleware CSP (`src/middleware.ts:187`) allows Astro's inline hydration scripts:

```
script-src 'self' 'unsafe-inline'
```

React islands hydrate correctly via `<astro-island>` elements.

**Historical note:** Astro 6 requires `'unsafe-inline'` in the `script-src` directive for React component hydration. Without it, islands render SSR HTML but never hydrate.

## Tests

### Unit (Vitest)

```bash
pnpm test:run          # Single run
pnpm test:coverage     # With coverage report
```

**Target coverage:** lines 80%, functions 75%, branches 70%

**Patterns:**

- DB mocked with `vi.mock('@/core/lib/db')`
- Tests live in `__tests__/` next to the file under test

### E2E (Playwright)

```bash
pnpm test:e2e
pnpm test:e2e:dev      # With automatic dev server
```

## Path Aliases

```json
{
  "@/*": ["./src/*"],
  "@core/*": ["./src/core/*"],
  "@modules/*": ["./src/modules/*"]
}
```

## Branch Strategy

- `production`: Main branch, always production-ready
- `develop`: Feature integration
- `feat/*`, `fix/*`, `refactor/*`, `chore/*`: Working branches

## Release & Deploy

Deploy controlled by semantic tags:

```bash
git tag v1.0.0
git push origin v1.0.0
```

CI detects the tag, runs lint, tests, build, and deploys to Cloudflare Workers.

| Type            | Example  |
| --------------- | -------- |
| New feature     | `v1.1.0` |
| Hotfix          | `v1.1.1` |
| Breaking change | `v2.0.0` |
