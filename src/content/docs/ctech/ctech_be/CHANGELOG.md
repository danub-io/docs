---
title: "Changelog"
---

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **`review_type` column in `Reviews` table:** Added `review_type` field (`'critic' | 'user'`) via ALTER TABLE to support user reviews on the frontend.
- **M9: Documentation** — New module at `/docs` that centralizes all project documentation
  - Sidebar with navigation across all documents
  - Integrated search via Command Palette (Ctrl+K)
  - Markdown rendering with GFM support
  - Dynamic routes for all project documents
- M9 integration into the ActivityBar (main navigation)
- `react-markdown` and `remark-gfm` dependencies for rendering
- Full API documentation (`API.md`)
- Contribution guide (`CONTRIBUTING.md`)
- **DLQ (Dead Letter Queue):** Resilience system for failed jobs after 3 attempts (commit `32c06d3`)
- **Structured Logging:** Pino implementation via `@/lib/logger` for auditing critical modules (commit `32c06d3`)
- **M3:** Missing spec extraction from reviews using AI (commit `82e3ff5`)
- **In-memory cache on BE:** Map-based cache with configurable TTL (5-10 min) and automatic invalidation on mutations
- **Database Maintenance Page:** New route `/8-configuracoes/manutencao` with 5 purge functions
- **Migration 0004:** Indexes and Guides/Guide_Products tables in the schema
- **FE slug cache (1h) and category cache (30min)**
- **Aggregate function `obterProdutoCompleto` on FE** (3 parallel queries)
- **Cache bypass via `refresh` parameter**

### Optimized
- **N+1 queries rewritten:** LEFT JOIN + GROUP BY, Promise.all, native libsql transaction
- **Batch processing in `update-ia.ts`:** BATCH_SIZE=10, parallel HTTP with Promise.allSettled, conditional writes (only inserts history if price changed > R$5), single 90-day purge at the end

### Fixed
- **Security:** Fixed SQL Injection in IN clauses via parameterized placeholders (commit `08881d7`)
- **M4:** Eliminated N+1 bottleneck with batch processing in `processarConsolidacao` (commit `57b4d31`)
- **M3:** Fixed TypeScript types in `specs_extraidas` (commit `c18c7d9`)
- **Worker:** Fixed failing tests and expanded DLQ coverage (commits `3539464`, `7b11a7a`)
- **M1:** Updated system prompt for multiple devices in the entry module (commit `5f5a3dd`)
- **CRLF lines in .env.local:** Converted to Unix
- **Removed hardcoded credentials:** Removed from `scripts/seed-categories.js`

### Updated (2026-05-01)
- **API.md:** Added M8 (Settings), M9 (Documentation), Worker & Queue, and Utilities sections
  - 18 M8 Server Actions documented (`ai-models.ts`, `scraping-services.ts`, `logs.ts`, `preferences.ts`)
  - Worker functions (`processNextJob`, `runWorkerBatch`)
  - Utilities (`getSetting`, `setSetting`, `atualizarPrecosComIA`)
- **ARCHITECTURE.md:** Added M9 (Documentation) to the modules section
- **docs/architecture/:** Populated with `diagrams.md`, `queue-system.md`, `repository-pattern.md`, `ai-integration.md`
- **docs/deployment/:** Populated with `vercel.md`, `docker.md`, `environment.md`
- **docs/troubleshooting/:** Populated with `database.md`, `scraping.md`, `ai-services.md`, `common-errors.md`

### Documentation
- **`docs/architecture/schema-banco.md`:** New — complete Turso schema (12 tables, indexes, relationships)
- **`docs/operations/monitoramento.md`:** New — Pino logging, health check, workers, DLQ, alerts
- **`docs/development/setup-local.md`:** New — local setup with migrations and troubleshooting
- **`CONTRIBUTING.md`:** Fixed Node.js version (18+ → >= 22.12.0)

### Improved
- Project documentation structure
- Module renames for consistent naming (e.g., `2-busca-link-review` → `2-descoberta`, `5-busca-precos` → `5-precos`)

---

## [0.1.0] - 2026-04-15

### Added
- M1: Entry Module (AI-powered product ingestion)
- M2: Discovery Module (Web scraping for reviews)
- M3: Extraction Module (AI-powered technical review analysis)
- M4: Consolidation Module (Final AI verdict with Bayesian scoring)
- M5: Price Module (Price monitoring across stores)
- M6: Checkout Module (Link and price audit)
- M7: CMS Module (Catalog manager)
- M8: Settings Module (AI model and scraping management)
- Repository Pattern for data access
- Integration with multiple AI providers (Google, Groq, Cerebras, OpenRouter, GitHub Models)
- Queue system for async processing
- Unit tests with Vitest (60% coverage)
- E2E tests with Playwright
- CI/CD with GitHub Actions
- Structured logging with Pino
- Turso (libsql) support with Drizzle ORM
- Initial documentation (README.md, ARCHITECTURE.md)

### Configuration
- Next.js 16.2.3 with App Router
- TypeScript in strict mode
- Tailwind CSS v4 + Shadcn/ui
- ESLint configured
- EditorConfig (UTF-8 without BOM, 2 spaces)
