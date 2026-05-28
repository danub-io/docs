---
title: "Data Layer — CTECH Frontend"
---

This document describes how the frontend consumes, transforms, and displays data, including the Turso database connection, available services, and shared types.

## Overview

ctech_fe queries the Turso database **directly** in Server-Side Rendering (SSR) via the `@libsql/client` driver. There is no intermediate REST API layer — the backend (ctech_be) writes data, and the frontend reads it.

```
ctech_be (Server Actions) → Turso DB (SQLite) ← ctech_fe (Astro SSR)
```

> **Security Note:** The Turso client is only used in SSR (never exposed to the browser). All queries are parameterized to prevent SQL injection.

## Database Connection

**File:** `src/core/lib/db.ts`

```typescript
import { createClient } from '@libsql/client';

export const db = createClient({
  url: import.meta.env.TURSO_DATABASE_URL,
  authToken: import.meta.env.TURSO_AUTH_TOKEN || '',
});
```

**Required environment variables:**
- `TURSO_DATABASE_URL` — Turso database URL (required in production and dev)
- `TURSO_AUTH_TOKEN` — Authentication token (required in production)

## Services

Each domain has a service that encapsulates SQL queries and transformations.

### Core Services

| Service | File | Functions | Cache | Description |
|---------|------|-----------|-------|-------------|
| `servicoCatalogo` | `src/core/services/servicoCatalogo.ts` | `getCategories()` | 5 min | Lists unique categories |
| `servicoMenu` | `src/core/services/servicoMenu.ts` | `getMenu()` | 5 min | Navigation menu with subcategories |
| `servicoProduto` | `src/modules/product/services/servicoProduto.ts` | `getAllSlugs()` | 1h | Product slugs for pre-rendering |
| `servicoGuia` | `src/modules/guide/services/servicoGuia.ts` | `getCategoriesWithGuides()` | 30 min | Categories with at least 1 active guide |

### Module Services

| Module | Service | Functions | Cache | Description |
|--------|---------|-----------|-------|-------------|
| **Home** | `servicoInicio` | `getFeaturedProduct()`, `getRecentProducts()` | 2 min | Featured and recent products |
| **Compare** | `servicoComparacao` | `getComparisonProducts(ids)`, `getTopProducts(limit)`, `getSearchSuggestions(query)` | — | Comparison and search |
| **Category** | `servicoCategoria` | `getProductsByCategory(category, filters?)`, `getProductsGroupedByTier(category, filters?)`, `getTierLabel(tier)` | — | Category pages |
| **Search** | `servicoBusca` | `search(filters)` | — | Full-text search with pagination and facets |
| **Product** | `servicoProduto` | `getProductBySlug(slug)`, `getAllSlugs()`, `getPressReviews(productId)`, `getUserReviews(productId)`, `getAffiliates(productId)`, `getFullProduct(slug)` | — (1h slugs) | Product pages, reviews, affiliates, and aggregate function |
| **Guide** | `servicoGuia` | `getGuidesByCategory(category)`, `getGuideBySlug(slug)`, `getGuideProducts(guideId)`, `getAllActiveGuides()`, `getCategoriesWithGuides()` | — (30min cats) | Recommendation guides |
| **Community** | `servicoComunidade` | `getRecentReviews(limit)` | — | Community feed |

## Types and Validation

### ProductSchema (`src/core/types/product.ts`)

Zod schema that validates and transforms data from the `Produtos` table:

```typescript
export const ProductSchema = z.object({
  id: z.number(),
  nome_produto: z.string(),
  marca: z.string().nullable().optional(),
  specs_json: z.string().nullable().optional().default('{}'),
  // ... other fields
}).transform((data) => ({
  ...data,
  specs: JSON.parse(data.specs_json || '{}') as Record<string, unknown>,
}));

export type Product = z.infer<typeof ProductSchema>;
```

### Other Zod Schemas

| Schema | File | Usage |
|--------|------|-------|
| `ReviewSchema` | `src/core/types/review.ts` | Press and user reviews |
| `CommunityReviewSchema` | `src/core/types/review.ts` | Review with product name (JOIN) |
| `GuideSchema` | `src/core/types/guide.ts` | Recommendation guide |
| `GuideProductSchema` | `src/core/types/guide.ts` | Guide-to-product relationship |
| `CategorySchema` | `src/core/services/servicoCatalogo.ts` | Product category |
| `AffiliateSchema` | `src/modules/product/services/servicoProduto.ts` | Affiliate (store, price, link) |

### Return Types

All services follow the pattern:
- **Success:** `Promise<Product[]>` or `Promise<Product | null>`
- **Error:** `Promise<[]>` or `Promise<null>` (never throw exceptions)

## Cache Strategy

### In-Memory Cache with Stampede Protection

The project uses an in-memory cache with TTL on specific services. To prevent **cache stampede** (multiple requests hitting the database simultaneously when the cache expires), each cache shares a `pendingFetch` across concurrent requests:

```typescript
// Implementation pattern (e.g., servicoCatalogo)
let cached: Category[] | null = null;
let lastFetch = 0;
let pendingFetch: Promise<Category[]> | null = null;
const TTL = 5 * 60 * 1000;

async getData() {
  if (cached && Date.now() - lastFetch < TTL) return cached;
  if (!pendingFetch) {
    pendingFetch = (async () => {
      try {
        const result = await db.execute(...);
        cached = result;
        lastFetch = Date.now();
        return cached;
      } catch {
        return cached || fallback;
      } finally {
        pendingFetch = null;
      }
    })();
  }
  return pendingFetch; // Reuses in-flight promise
}
```

| Service | Cached methods | TTL |
|---------|----------------|-----|
| `servicoCatalogo` | `getCategories()` | 5 min |
| `servicoMenu` | `getMenu()` | 5 min |
| `servicoProduto` | `getAllSlugs()` | 1h |
| `servicoGuia` | `getCategoriesWithGuides()` | 30 min |
| `servicoInicio` | `getFeaturedProduct()`, `getRecentProducts()` | 2 min |

Cache is invalidated only on server restart. Dynamic data (product, reviews, affiliates) does not use caching — it queries the database on every SSR request.

### SSR without Cache

The remaining services query the database on every SSR request. To improve performance at scale, consider:
- Adding HTTP cache (CDN) for static pages
- Implementing query caching with TTL for listings
- Using Astro ISR (Incremental Static Regeneration)

## Best Practices

1. **Parameterized queries:** Always use `?` placeholders and `args` — never concatenate values in SQL
2. **Error handling:** Every service has try/catch with fallback (empty array or null)
3. **Validation:** Use `Schema.safeParse()` for data that may be malformed
4. **Logging:** Errors are logged via `logger.error()` for debugging in development
5. **Performance:** Use `Promise.all()` for independent parallel queries
6. **Cache stampede:** Always use shared `pendingFetch` when implementing in-memory cache
