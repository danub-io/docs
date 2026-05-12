---
title: "Coding Conventions for AI Development"
description: "Naming conventions, folder structure, and error handling patterns for consistent code generation"
---

This document defines the CTECH ecosystem conventions so that AI tools generate code consistent with the rest of the project.

## ShadCN UI

- **Style:** `base-nova` (light/dark theme via `next-themes` or `astro-themes`)
- **Primitives:** `@base-ui/react` (MUI) — **not** Radix
- **Installation:** `pnpm dlx shadcn@latest add <component> -y`
- **Variants:** use `cn()` from `@/lib/utils` to combine Tailwind classes
- **Customization:** avoid overriding ShadCN base classes; use `className` for extension

---

## Folder Structure (ctech_fe)

```
src/
  core/          # Global infrastructure (NEVER change without extreme need)
    ui/          # ShadCN components (button, card, badge, etc.)
    layouts/     # Layout, Navbar, Footer
    lib/         # db.ts, cache.ts, logger.ts, cn.ts, corNota.ts
    services/    # servicoCatalogo.ts, servicoMenu.ts
    styles/      # Global CSS + Tailwind v4 design tokens
    types/       # Zod schemas and TS types (product.ts, avaliacao.ts, guia.ts)
  modules/       # Isolated business domains (CHANGE HERE)
    inicio/      # Home page
    produto/     # Product pages
    categoria/   # Category pages
    guia/        # Recommendation guides
    busca/       # Full-text search
    comparar/    # Product comparison
    comunidade/  # Community feed
    auth/        # Authentication
    rolagem_horizontal/  # Horizontal carousel
  pages/         # Astro routes (thin layer, only orchestrates data -> components)
    api/auth/    # Authentication endpoints (REST JSON)
```

---

## Naming Conventions

### Files

| Type | Pattern | Example |
|------|---------|---------|
| Service | `servico[Nome].ts` | `servicoProduto.ts`, `servicoBusca.ts` |
| Astro Component | `[Nome].astro` | `ProdutoDestaque.astro`, `CardGuia.astro` |
| React Component | `[Nome].tsx` | `NotaBadge.tsx`, `LoginDialog.tsx` |
| Zod Schema | In type file | `ProductSchema` in `product.ts` |
| Test | `__tests__/[nome].test.ts` | `__tests__/servicoProduto.test.ts` |
| Repository (BE) | `[modulo]-repository.ts` | `cms-repository.ts` |

### Functions and Methods

| Context | Pattern | Example |
|---------|---------|---------|
| Services (query) | `obter*()` | `obterProdutoPorSlug()`, `obterCategorias()` |
| Services (mutation) | `criar*()`, `atualizar*()`, `deletar*()` | `criarAvaliacao()` |
| Server Actions (BE) | `processar*()`, `get*()`, `salvar*()` | `processarIngestao()`, `getAIModels()` |
| Repositories (BE) | `get*()`, `update*()`, `delete*()` | `getProdutos()`, `updateProduto()` |

### Path Aliases

```json
{
  "@/*": ["./src/*"],
  "@core/*": ["./src/core/*"],
  "@modules/*": ["./src/modules/*"]
}
```

Always use aliases instead of deep relative paths:
```typescript
// Correct
import { servicoProduto } from "@modules/produto/services/servicoProduto";
import { db } from "@core/lib/db";

// Wrong
import { servicoProduto } from "../../modules/produto/services/servicoProduto";
```

---

## Database Connection

### ctech_fe (SSR read)

```typescript
// src/core/lib/db.ts
import { createClient } from "@libsql/client";
export const db = createClient({
  url: import.meta.env.TURSO_DATABASE_URL || process.env.TURSO_DATABASE_URL || "",
  authToken: import.meta.env.TURSO_AUTH_TOKEN || process.env.TURSO_AUTH_TOKEN || "",
});
```

The Turso client is only used in SSR. Never import `db.ts` in React components.

### ctech_be (read and write)

Uses Drizzle ORM (`src/db/schema.ts`) + `@/lib/db` for direct queries when necessary.

---

## Error Handling in Services (ctech_fe)

Every service follows this pattern:

```typescript
export async function obterDados(): Promise<Produto[]> {
  try {
    const result = await db.execute({ sql: "SELECT * FROM ...", args: [...] });
    return result.rows.map(row => ProductSchema.parse(row));
  } catch (error) {
    logger.error("Failed to fetch data", error);
    return []; // Never throw
  }
}
```

**Rules:**
- Success: returns typed data
- Parse error: returns `[]` or `null`
- Database error: returns `[]` or `null`
- Empty result: returns `[]` or `null`
- Never use `throw` in services (the page must never break)

---

## Validation with Zod

Always use `safeParse()` instead of `parse()` for data that may come malformed:

```typescript
const parsed = ProductSchema.safeParse(row);
if (!parsed.success) {
  logger.warn("Malformed product", { row, error: parsed.error });
  return null; // or skip the item
}
return parsed.data;
```

---

## Cache Pattern with Stampede Protection

```typescript
let cached: Tipo | null = null;
let lastFetch = 0;
let pendingFetch: Promise<Tipo> | null = null;
const TTL = 5 * 60 * 1000;

async function obterDados(): Promise<Tipo> {
  if (cached && Date.now() - lastFetch < TTL) return cached;
  if (!pendingFetch) {
    pendingFetch = (async () => {
      try {
        const data = await buscarNoBanco();
        cached = data;
        lastFetch = Date.now();
        return data;
      } catch (error) {
        logger.error("Cache fetch failed", error);
        return cached || []; // fallback to stale data or empty
      } finally {
        pendingFetch = null;
      }
    })();
  }
  return pendingFetch; // Reuses in-flight promise (stampede protection)
}
```

Cache is always in-memory (Map), never shared between instances.

---

## SQL Queries

Always parameterized:

```typescript
// Correct
await db.execute({
  sql: "SELECT * FROM Produtos WHERE categoria = ? AND status = ?",
  args: [categoria, "AprovadoM4"],
});

// Wrong (SQL injection)
await db.execute(`SELECT * FROM Produtos WHERE categoria = '${categoria}'`);
```

---

## Tests (ctech_fe)

### Database Mock

```typescript
vi.mock("@/core/lib/db", () => ({
  db: { execute: vi.fn() },
}));

// Success
(db.execute as any).mockResolvedValueOnce({ rows: [...] });
// Error
(db.execute as any).mockRejectedValueOnce(new Error("DB error"));
// Parse error (malformed return)
(db.execute as any).mockResolvedValueOnce({ rows: [{ invalid_column: "value" }] });
```

### Required scenarios for every tested service:
- Parse error: malformed data -> service returns `[]`
- DB error: connection failure -> service returns `[]`
- Empty results: query with no data -> service returns `[]`

---

## Components: Astro vs React

| Situation | Use |
|-----------|-----|
| Static content (lists, grids, headers) | **Astro** (zero JS) |
| Local state, events, hooks | **React** with `client:*` |
| Immediate hydration (critical) | `client:load` |
| Below the fold | `client:visible` (preferred) |
| Non-urgent | `client:idle` |

UI components (Badge, Button, Card, Progress) are React but render in SSR without `client:*`.

---

## Commands

### ctech_fe

| Command | Description |
|---------|-------------|
| `pnpm dev` | Dev server (localhost:4321) |
| `pnpm build` | Production build |
| `pnpm preview` | Build preview |
| `pnpm test:run` | Unit tests (single run) |
| `pnpm test:coverage` | Tests with coverage |
| `pnpm test:e2e` | E2E tests (Playwright) |
| `pnpm lint` | ESLint |
| `pnpm format` | Prettier |
| `pnpm deploy` | Deploy via wrangler |

### ctech_be

| Command | Description |
|---------|-------------|
| `pnpm dev` | Dev server (localhost:3001) |
| `pnpm build` | Production build |
| `pnpm test:run` | Unit tests |
| `pnpm lint` | ESLint |
| `pnpm db:generate` | Generate Drizzle migrations |
| `pnpm db:push` | Apply migrations |
| `pnpm db:studio` | Drizzle Studio |

---

## Middleware and Content Security Policy (CSP)

The middleware in `src/middleware.ts` applies security headers to all non-asset routes.

### CSP blocks Astro inline scripts

The `script-src 'self'` policy in the middleware **blocks the inline scripts** that Astro uses to hydrate React components (`<astro-island>`, `Astro.load` definition, etc.).

**Symptom:** All React islands with `client:load` fail silently — the SSR HTML is rendered but the components never hydrate. No visible errors in the browser console, only CSP warnings in the console.

**Diagnosis:** Check whether `<astro-island>` retains the `ssr` attribute after page load. If so, hydration did not occur. Use devtools or `page.evaluate(() => document.querySelector('astro-island').hasAttribute('ssr'))`.

**Fix:** Add `'unsafe-inline'` to `script-src`:
```
script-src 'self' 'unsafe-inline'
```

**Code location:** `src/middleware.ts:180`

---

## Languages in Code

- **Service, component, and variable names:** Portuguese (`obterProdutoPorSlug`, `servicoCatalogo`)
- **Code (keywords, types):** English (`interface`, `Promise`, `ProductSchema`)
- **Comments and documentation:** Portuguese

---

## Documentation Maintenance

Whenever you make significant changes, update the corresponding documentation:

- New service/search → update `docs/architecture/search.md`
- New component → update `docs/architecture/components.md`
- New route/architecture → update relevant `docs/architecture/`
- New schema/table → update `database-schema.md`
- Environment variable → update `docs/deployment/environment.md`
- Non-trivial bug → create postmortem in `postmortems/`
- New architecture document → add a `Contem:` inline in SKILL.md (`~/.config/kilo/skills/contexto-ctech/SKILL.md`) right after the `Leia` line(s) of the corresponding section. Format: 1 line, max 80 chars, comma-separated. Ex: `Contem: OpenTelemetry, tracing, metrics, alertas`
