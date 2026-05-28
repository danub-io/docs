---
title: "CTECH Frontend (TechReveal)"
---

**Public-facing site that reads from the database to display products, categories, and prices.** It also writes user data (registration, login, Google OAuth, 2FA, user reviews).

---

High-performance public interface for the CTECH ecosystem. Built with **Astro 6** and **React 19**, focused on SEO, speed, and user experience. Deployed on **Cloudflare Workers**.

## Technologies

- **Framework:** Astro 6+ (SSR) with Islands Architecture
- **Adapter:** `@astrojs/cloudflare` (Cloudflare Workers)
- **UI Library:** React 19 (interactive components)
- **Styling:** Tailwind CSS v4 + Custom Design Tokens
- **Components:** ShadCN v4 via `@base-ui/react` (MUI primitives)
- **Database:** Turso (libsql) — Distributed SQLite
- **Validation:** Zod v4
- **Images:** Native `<img>` (partner CDNs already deliver optimized WebP)
- **Testing:** Vitest (unit) + Playwright (E2E)
- **CI/CD:** GitHub Actions + Wrangler Deploy via semantic tags

## Installation & Running

### Prerequisites

- `pnpm` installed
- Node.js >= 22.12.0
- A [Turso](https://turso.tech) account (database)

### Environment Variables

Copy `.env.example` to `.dev.vars` (required by the Cloudflare Workers runtime):

```ini
TURSO_DATABASE_URL=libsql://your-database.turso.io
TURSO_AUTH_TOKEN=your-token-here
AUTH_SECRET=your-jwt-secret
```

### Commands

```bash
pnpm install                    # Install dependencies
pnpm dev                        # Local server (localhost:4321)
pnpm build                      # Production build
pnpm preview                    # Preview build
pnpm test:run                   # Unit tests (single run)
pnpm test:coverage              # Tests with coverage report
pnpm test:e2e                   # End-to-end tests (Playwright)
pnpm lint                       # Run ESLint
pnpm format                     # Format code with Prettier
pnpm generate-types             # Generate Cloudflare Worker types
pnpm deploy                     # Manual deploy via wrangler deploy
pnpm release                    # Build + deploy (for use with tags)
```

## Routes

| Route | Description |
|-------|-------------|
| `/` | Home page with featured product and trends |
| `/:category` | Product listing page by category |
| `/:category/:slug` | Detailed product page |
| `/:category/:slug/reviews` | Press reviews for the product |
| `/:category/:slug/user-reviews` | User reviews for the product |
| `/guide` | Index of recommendation guides |
| `/guide/:slug` | Individual guide page with selected products |
| `/dashboard` | Authenticated user dashboard |

Legacy routes (`/product/:slug`, `/category/:category`) have 301 redirects maintained for SEO.

## Architecture

The project follows a **Modular (Vibecoding)** methodology, optimized for AI-assisted development:

```
src/
├── core/           # Global infrastructure (UI, layouts, lib, services, styles, types)
│   └── ui/         # ShadCN components (button, card, badge, etc.)
├── modules/        # Isolated domains (home, product, category, guide, auth, etc.)
│   ├── auth/       # Authentication (services, components, schemas)
│   └── .../
│       ├── components/   # Module Astro/React components
│       └── services/     # Data access services
└── pages/          # Astro routes (thin layer, orchestrates components)
    └── api/auth/   # Authentication endpoints (REST JSON)
```

## Data Flow

```
Turso DB (libsql) ← ctech_be (writes)
    ↓ SSR queries (parameterized)
Services (try/catch → Zod validation)
    ↓
Astro Pages (SSR frontmatter)
    ↓
Astro/React Components (props → render)
```

- **Server-Side Rendering:** All data is fetched in Astro page frontmatter
- **Never on the client:** The database is not accessed in the browser
- **Components with `server:defer`** can fetch their own data

## Cache

In-memory cache (Map) with stampede protection (shared `pendingFetch`):

| Service | Cached Methods | TTL |
|---------|---------------|-----|
| `servicoCatalogo` | `getCategories()` | 5 min |
| `servicoMenu` | `getMenu()` | 5 min |
| `servicoProduto` | `getAllSlugs()` | 1h |
| `servicoGuia` | `getCategoriesWithGuides()` | 30 min |
| `servicoInicio` | `getFeaturedProduct()`, `getRecentProducts()` | 2 min |

Cache is invalidated only on server restart (in-memory only).

## Deploy

Production deployment is controlled by **semantic tags**, not by direct pushes to the `production` branch:

```bash
git tag v1.0.0
git push origin v1.0.0
```

CI detects the tag, runs lint, tests, build, and automatically deploys to Cloudflare Workers.

For manual test deployment:
```bash
pnpm deploy
```

### Worker Secrets

Before the first deploy, configure the secrets:
```bash
pnpm wrangler secret put TURSO_DATABASE_URL
pnpm wrangler secret put TURSO_AUTH_TOKEN
pnpm wrangler secret put AUTH_SECRET
pnpm wrangler secret put GOOGLE_CLIENT_ID
pnpm wrangler secret put GOOGLE_CLIENT_SECRET
```

## Security

- Content Security Policy (CSP) configured via middleware
- HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy
- Rate limiting on auth routes (D1 database)
- Parameterized database queries (no SQL injection)
- Turso client used only in SSR (never exposed to the client)
- JWT authentication with 2FA via otplib

## Image Strategy

We use native `<img>` instead of `<Image />` from `astro:assets` for two reasons:

1. The `noop` service doesn't optimize anything — `<Image />` with `noop` only generates proxied URLs that pass through the Worker without transforming the image
2. Partner CDNs (Amazon, Kabum, etc.) already deliver WebP and appropriate dimensions

If Cloudflare adds an `images` binding in the future, it's worth revisiting.

## License

MIT — CTECH Frontend
