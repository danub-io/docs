---
title: "CTECH Panel (Backend)"
---

**Local tool that runs on your machine to populate the database.** Product ingestion, prices, reviews, etc. No login needed, won't be deployed, only you use it.

---

This is the "Brain" of the CTECH ecosystem. An admin panel and automation engine built with **Next.js 16+** that manages the data pipeline from raw input to final AI-powered consolidation.

## Technologies

- **Framework:** Next.js 16 (App Router) with Turbopack
- **Language:** TypeScript (Strict Mode)
- **Styling:** Tailwind CSS v4 + Shadcn/ui (@base-ui/react)
- **Database:** Turso (libsql) with Drizzle ORM
- **AI:** Vercel AI SDK (multi-provider: Google, Groq, Cerebras, OpenRouter, GitHub Models)
- **Logging:** Pino (Structured Logging)
- **Testing:** Vitest & Playwright
- **Scraping:** Puppeteer Extra + Stealth Plugin, Mozilla Readability, Cheerio

## Installation and Running

### Prerequisites
- `pnpm` installed globally
- `.env.local` file configured (see `.env.example`)

### Commands
```bash
pnpm install              # Install dependencies
pnpm dev                  # Start development server (port 3001)
pnpm build                # Build for production
pnpm start                # Start production server
pnpm test:run             # Run unit tests
pnpm test:e2e             # Run E2E tests (Playwright)
pnpm lint                 # Run linter
pnpm db:generate          # Generate Drizzle migrations
pnpm db:migrate           # Apply migrations
pnpm db:studio            # Open Drizzle Studio
```

## Architecture: 9 Modules (M1-M9)

The project is divided into 9 independent modules, each isolated for easy editing via vibecoding:

### M1 — Entry
Ingestion and semantic duplicate detection. AI extracts a JSON with `brand`, `product_name`, `raw_specs`, `tier I-V` from raw text. Similar candidates are sent for AI semantic verdict.

### M2 — Discovery
Bulk search for technical review links via search templates. AI filters links by discarding forums, videos, and stores.

### M3 — Extraction
Article reading, scoring (0-10), extraction of `pros`, `cons`, `mini_review`, and missing specs. Review_type distinguishes critic from user.

### M4 — Consolidation
Acts as Editor-in-Chief: aggregates up to 8 reviews, calculates Bayesian Score (global average 7.5, min. 3 reviews) with Lag Factor (0.2/year). Synthesizes Final Verdict.

### M5 — Prices
Continuous price monitoring via Google Shopping. False positive detection (case, cable, wrong model). Variations > R$5.00 stored in `price_history` (90-day retention).

### M6 — Checkout
Final link (Affiliate) audit: scraper navigates to the saved URL to capture PIX/Boleto price and stock.

### M7 — CMS
Central product catalog manager (CRUD) with listing, filters (brand, category, launch), editing and deletion.

### M8 — Settings
Modular global settings panel: AI models (6-tier cascade), scraping services, system logs, database maintenance, preferences.

### M9 — Documentation
Built-in Markdown documentation viewer with sidebar, search (Ctrl+K), and GFM rendering.

## Queue System

- `processing_queue` table manages background jobs (status: pending, processing, completed, error, critical_failure)
- **DLQ (Dead Letter Queue):** After 3 failed attempts, job is marked as `critical_failure`
- Worker performs atomic claim with batch processing (BATCH_SIZE=10)

## Smart Cache

In-memory cache (Map) with configurable TTL via `CacheLayer`:

| Query | TTL |
|-------|-----|
| `getAIModels`, `getScrapingServices`, `getDefaultPrompt` | 10 min |
| `getProductsToConsolidate`, `getProductsForReviewSearch` | 5 min |

Automatic invalidation on mutations. Cache bypass via `refresh = true` parameter.

## Performance Strategy

- **Prioritized SSR:** Heavy query modules use SSR
- **Parallel I/O:** `Promise.all()` required on pages with multiple data sources
- **Suspense + Skeletons:** `ModuleSkeleton` for immediate visual feedback
- **Prefetching:** All ActivityBar links with `prefetch={true}`
- **Resizable Panels:** `react-resizable-panels` v4 with `autoSaveId` for persistence

## Database (Turso SQLite)

Main tables: `Products`, `Reviews` (with `review_type`), `Affiliates`, `price_history`, `processing_queue`, `config_ai_models`, `config_scraping_services`, `entry_logs`, `config_preferences`, `Guides`, `Guide_Products`.

Obsolete columns removed in Apr/2026 (`embedding`, `is_primary`, `is_fallback`, `is_reserve`, `Affiliates.image_url`).

## Security

- API Keys encrypted with AES-256-CBC in configuration tables
- Parameterized SQL (injection-proof)
- JWT tokens with jose
- Rate limiting on authentication routes

## Migrations

Managed via Drizzle Kit:
```bash
pnpm db:generate    # Generate migration
pnpm db:migrate     # Apply migration
```

For manual SQL migrations (e.g., rate_limit), run via Turso CLI:
```bash
turso db shell <database> < migrations/file.sql
```

## License

MIT — CTECH Backend
