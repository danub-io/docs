---
title: "Ecosystem Overview"
description: "Complete LUPINHO data flow: from backend ingestion to frontend display"
---

This document describes the complete flow of a product through the LUPINHO ecosystem, from raw input in the backend (lupinho_be) to display on the public page (lupinho_fe).

---

## Two-Layer Architecture

```
lupinho_be (Next.js + Drizzle)
    | Server Actions write to the database
    v
Turso DB (distributed SQLite)  ←  shared database
    ^
    | SSR queries read directly
lupinho_fe (Astro + @libsql/client)
```

There is no intermediate REST API. Both projects connect to the same Turso database.

---

## Product Pipeline (M1-M9)

### Backend: Ingestion and Curation

```
Raw text (user)
    |
    v
M1 Entry         -> AI extracts brand, name, specs, tier. Detects duplicates.
    |
    v
M2 Discovery     -> Searches for technical review links (Google). AI filters.
    |
    v
M3 Extraction    -> Article scraping -> Markdown -> AI analyzes (score, pros, cons)
    |
    v
M4 Consolidation -> Aggregates up to 8 reviews. Bayesian score. AI synthesizes verdict.
    |              Product marked as 'ApprovedM4' (visible on frontend)
    |
    v
M5 Prices        -> Searches prices (Google Shopping). AI validates correct model.
    |
    v
M6 Auditing      -> Final audit: scraper navigates to link, captures price + stock.
    |
    v
M7 CMS           -> Catalog CRUD. Listing, editing, deletion.
M8 Settings      -> AI models, scraping services, logs, preferences.
M9 Documentation -> Integrated markdown viewer.
```

### Frontend: Public Display

```
Turso DB
    | SSR queries (parameterized)
    v
Services (src/core/services/ or src/modules/*/services/)
    | try/catch + safeParse Zod
    v
Astro Pages (src/pages/)
    | frontmatter fetches data
    v
Astro/React Components (props -> render)
    | Astro for presentation, React for interactivity
    v
Static HTML + hydrated Islands on client
```

---

## Database Tables (Overview)

| Table | Description | Written by | Read by |
|--------|----------|-------------|-------------|
| `Produtos` | Central product catalog | lupinho_be (M1-M7) | lupinho_fe |
| `Reviews` | Press (critic) and user reviews | lupinho_be (M3) + lupinho_fe | Both |
| `Afiliados` | Store links with prices | lupinho_be (M5-M6) | lupinho_fe |
| `historico_precos` | Price history (90 days) | lupinho_be (M5) | — |
| `fila_processamento` | Async jobs (M1-M6) | lupinho_be | — |
| `Guias` / `Guia_Produtos` | Editorial recommendation guides | lupinho_be | lupinho_fe |
| `config_ai_models` | Configured AI models | lupinho_be (M8) | lupinho_be |
| `config_scraping_services` | Scraping services | lupinho_be (M8) | lupinho_be |
| `logs_entrada` | Audit (tokens, cost) | lupinho_be | lupinho_be |
| `conflitos_entrada` | Detected duplicates | lupinho_be (M1) | lupinho_be |

> Full schema: [database-schema.md](./database-schema.md)

---

## Frontend Services (Map)

Each domain in lupinho_fe has a service that encapsulates SQL queries.

### Core Services (src/core/services/)

| Service | Methods | Cache | TTL |
|---------|---------|-------|-----|
| `servicoCatalogo` | `obterCategorias()` | Yes | 5 min |
| `servicoMenu` | `obterMenu()` | Yes | 5 min |

### Module Services (src/modules/*/services/)

| Module | Service | Key methods | Cache |
|--------|---------|--------------------|-------|
| Home | `servicoInicio` | `obterProdutoDestaque()`, `obterProdutosRecentes()` | 2 min |
| Product | `servicoProduto` | `obterProdutoPorSlug()`, `obterProdutoCompleto()`, `obterAvaliacoesCriticas()`, `obterAfiliados()` | Slugs: 1h |
| Category | `servicoCategoria` | `obterProdutosPorCategoria()`, `obterProdutosAgrupadosPorNivel()` | — |
| Guide | `servicoGuia` | `obterGuiasPorCategoria()`, `obterGuiaPorSlug()`, `obterProdutosDoGuia()`, `obterCategoriasComGuias()` | Cats: 30min |
| Search | `servicoBusca` | `buscar(filtros)` | — |
| Compare | `servicoComparacao` | `obterProdutosComparacao()`, `obterTopProdutos()`, `obterSugestoesBusca()` | — |
| Community | `servicoComunidade` | `obterAvaliacoesRecentes()` | — |
| Auth | `servicoAuth` | `verificarToken()`, `buscarUsuarioPorId()` | — |

> All services return `[]` or `null` on error (never throw exceptions).

---

## Frontend Routes

| Route | Description |
|------|-----------|
| `/` | Home with featured and recent products |
| `/:categoria` | Category page / guide hub |
| `/:categoria/:slug` | Detailed product page |
| `/:categoria/:slug/reviews` | Press reviews |
| `/:categoria/:slug/user-reviews` | User reviews |
| `/guia` | Guide index |
| `/guia/:slug` | Guide page with selected products |
| `/busca?q=...` | Full-text search with filters and pagination |
| `/comparar?ids=...` | Side-by-side comparison |
| `/comunidade` | Community feed |
| `/painel` | Authenticated user panel |

---

## Coding Conventions for AI

See [conventions.md](./conventions.md) for detailed standards on:
- Service, component, and type naming conventions
- `core/` vs `modules/` folder structure
- Path aliases (`@core/*`, `@modules/*`)
- Cache pattern with `pendingFetch`
- Error handling in services
