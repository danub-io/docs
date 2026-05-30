---
title: "ADR-004: In-Memory Cache with Stampede Protection"
---



**Date:** 2026-04-20
**Status:** Accepted

## Context

Frontend services query Turso directly in SSR. Repetitive queries (categories, slugs, menus) introduce unnecessary latency. We needed a cache that:
- Is simple (no Redis/DynamoDB)
- Protects against cache stampede (N requests hitting the database when the cache expires)
- Works in serverless (no shared state between instances)

## Decision

We implemented an in-memory cache (Map) with configurable TTL and stampede protection via a shared `pendingFetch`.

## Pattern

```typescript
let cached: T | null = null;
let lastFetch = 0;
let pendingFetch: Promise<T> | null = null;

async function obter() {
  if (cached && Date.now() - lastFetch < TTL) return cached;
  if (!pendingFetch) {
    pendingFetch = (async () => {
      try { /* fetch */ } finally { pendingFetch = null; }
    })();
  }
  return pendingFetch;
}
```

## Alternatives Considered

| Alternative | Reason for Rejection |
|------------|-------------------|
| Redis | External dependency, operational cost |
| HTTP Cache (CDN) | Does not work for dynamic data in SSR |
| No cache | High latency on every request |
| Map cache without stampede protection | N concurrent requests hit the database |

## Consequences

- Positives: Zero external dependencies, built-in stampede prevention
- Negatives: Cache is only invalidated on server restart (in-memory)
- Negatives: Cache is not shared between instances (acceptable for serverless with low concurrency)

## Current TTLs

The default TTL is determined at runtime by environment:

- **DEV** (`import.meta.env.DEV`): `TTL_PADRAO_DEV = 1_800_000ms` (30 min)
- **PROD**: `TTL_PADRAO_PROD = 300_000ms` (5 min)

Services that call `createCache(undefined, ...)` without an explicit TTL inherit the environment default. Only `cacheSlugs` uses an explicit override.

| Service                               | TTL                                | Notes                         |
| ------------------------------------- | ---------------------------------- | ----------------------------- |
| `servicoCatalogo.obterCategorias`     | Default (DEV: 30 min, PROD: 5 min) | Uses environment default      |
| `servicoMenu.obterMenu`               | Default (DEV: 30 min, PROD: 5 min) | Uses environment default      |
| `servicoProduto.obterTodosSlugs`      | 1 h                                | Explicit TTL via `cacheSlugs` |
| `servicoGuia.obterCategoriasComGuias` | Default (DEV: 30 min, PROD: 5 min) | Uses environment default      |
| `servicoInicio` (featured + recent)   | Default (DEV: 30 min, PROD: 5 min) | Uses environment default      |

## References

- `tribarato_fe/DATA_LAYER.md`
- `tribarato_fe/AGENTS.md`
