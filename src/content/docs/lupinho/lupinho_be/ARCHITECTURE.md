---
title: "Architecture — LUPINHO Backend"
---

## Overview

Hardware technical curation and business intelligence ecosystem. An automated pipeline that transforms raw text into publishable product sheets with consolidated reviews, monitored prices, and audited affiliate links.

```
Raw text → M1 (Entry) → M2 (Discovery) → M3 (Extraction) → M4 (Consolidation) → Final product
                                                               M5 (Prices) → M6 (Auditing) → Affiliate
```

## Directory Structure

```
src/
├── app/
│   ├── 1-entrada/        # M1: Entry UI
│   ├── 2-descoberta/     # M2: Discovery UI
│   ├── 3-extracao/       # M3: Extraction UI
│   ├── 4-consolidacao/   # M4: Consolidation UI
│   ├── 5-precos/         # M5: Prices UI
│   ├── 6-conferencia/    # M6: Auditing UI
│   ├── 7-cms/            # M7: Catalog CMS
│   ├── 8-configuracoes/  # M8: Global settings
│   ├── docs/             # M9: Documentation viewer
│   ├── actions/          # Server Actions (business logic)
│   │   ├── entrada.ts    # M1 actions
│   │   ├── descoberta.ts # M2 actions
│   │   ├── extracao.ts   # M3 actions
│   │   ├── consolidacao.ts # M4 actions
│   │   ├── precos.ts     # M5 actions
│   │   ├── conferencia.ts # M6 actions
│   │   ├── cms.ts        # M7 actions
│   │   ├── 8-configuracoes/ # M8 actions (ai-models, scraping-services, logs, preferences)
│   │   ├── atualizar-ia.ts # AI model update
│   │   ├── manutencao.ts # Maintenance utilities
│   │   ├── settings.ts   # Settings helpers
│   │   ├── sidebar.ts    # Sidebar state
│   │   ├── worker.ts     # Queue worker
│   │   └── __tests__/    # Action unit tests
│   └── api/              # API routes (if any)
├── components/           # Global UI (ActivityBar, Sidebar, CommandPalette, Logs)
├── lib/                  # DB, scraping, queue, cache, encryption helpers
│   ├── repositories/     # Repository pattern (e.g., cms-repository.ts)
│   ├── cache.ts          # CacheLayer (Map-based with TTL)
│   └── logger.ts         # Pino structured logger
├── hooks/                # React hooks
├── db/                   # Drizzle config + schema
└── types/                # TypeScript types
```

## Queue System and Resilience

### Processing Flow

1. Job inserted into `processing_queue` with status `pending`
2. Worker performs atomic claim (status → `processing`)
3. On success: status → `completed`
4. On failure: increments `attempts`
5. If `attempts >= 3`: status → `critical_failure` (DLQ)

### Monitoring

Structured logging via Pino across all critical modules (M1-M6). Worker health check via the logs table.

## AI Providers

Multiple providers via Vercel AI SDK:

| Provider | Package | Usage |
|----------|--------|-------|
| Groq | `@ai-sdk/groq` | Fast extraction |
| Cerebras | `@ai-sdk/cerebras` | Batch processing |
| OpenRouter | `@openrouter/ai-sdk-provider` | Fallback |
| GitHub Models | `@github/models` | Various models |

Resilience cascade (6 tiers) configurable via `config_ai_models` table.

## Cache

In-memory cache (Map) via `CacheLayer`:

| Query | TTL | Invalidation |
|-------|-----|-------------|
| `getAIModels` | 10 min | upsert/delete/toggle AI model |
| `getScrapingServices` | 10 min | upsert/delete/toggle scraping service |
| `getDefaultPrompt` | 10 min | (manual) |
| `getProductsToConsolidate` | 5 min | M3/M4 approval |
| `getProductsForReviewSearch` | 5 min | M3/M4 approval |

Cache bypass: `{ refresh: true }` forces reload.

## Database Schema

Main tables and relationships:

- **Products:** Central catalog (specs, final score, image). Single source of truth for images.
- **Reviews:** Individual analyses (M3) and user reviews. `review_type` (`critic` | `user`).
- **Affiliates:** Final store/offer links validated in M6. (`image_url` column removed.)
- **price_history:** Price fluctuations (90-day retention).
- **processing_queue:** Background jobs (status, attempts, module, reference_id).
- **config_ai_models:** AI models with encrypted API keys (AES-256-CBC).
- **config_scraping_services:** Configurable scraping services.
- **entry_logs:** Consumption audit (tokens, cost, payload).
- **Guides / Guide_Products:** Editorial recommendation guides.

## Scraping

- **Puppeteer Extra + Stealth Plugin:** Navigation on e-commerce sites
- **Mozilla Readability:** Article text extraction
- **Cheerio:** Lightweight HTML parsing
- **Turndown:** HTML → Markdown

## Layout and UI

- **ActivityBar:** Main navigation between modules (icons + tooltips)
- **Sidebar:** Contextual per module
- **CommandPalette:** Global search (Ctrl+K)
- **GlobalResizableLayout:** Multi-column layout with resizable panels
- **Theme:** next-themes (light/dark)

## Development Environment

- **Turbo Mode:** `next dev --turbo` for fast hot reload
- **Local Database:** Turso local or remote via libsql
- **GitHub CLI:** `gh` for PR management
- **SSH:** GitHub connection via ED25519 keys

## Branch Strategy

- `production`: Main branch
- `develop`: Integration
- `feature/*`, `fix/*`, `refactor/*`, `chore/*`
