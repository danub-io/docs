---
title: "Architecture Diagrams - CTECH Panel"
---

## Main Pipeline (M1 → M7)

```
Raw Text (User)
       │
       ▼
┌──────────────┐
│   M1: ENTRY   │  AI extracts: brand, name, specs, tier
│  (Ingestion)  │  Detects semantic duplicates (SQL + AI)
└──────┬────────┘
       │ Validated products
       ▼
┌──────────────┐
│   M2: DISCOVERY│  Searches review links (Google)
│   (Reviews)    │  AI filters: discards stores/forums
└──────┬────────┘
       │ Approved links
       ▼
┌──────────────┐
│   M3: EXTRACTION│  Scraping → Markdown → AI analysis
│   (Analysis)    │  Output: score (0-10), pros, cons, mini_review
└──────┬────────┘
       │ Curated reviews
       ▼
┌──────────────┐
│  M4: CONSOLIDATION│  Aggregates up to 8 reviews
│  (Consolidation)  │  Bayesian Score + Lag Factor
│                   │  AI synthesizes final verdict
└──────┬────────────┘
       │ Product ready (M4 approved)
       ▼
┌──────────────┐
│   M5: PRICES    │  Fetches prices (Google Shopping)
│  (Commercial)   │  AI validates: is this the correct model?
│                  │  Monitors variation > R$ 5.00
└──────┬──────────┘
       │ Validated affiliate links
       ▼
┌──────────────┐
│  M6: CHECKOUT   │  Final link audit
│  (Audit)        │  Scraping: PIX/Boleto price + stock
│                  │  Marks status_erro if out of stock
└──────┬───────────┘
       │ Audited product
       ▼
┌──────────────┐
│   M7: CMS       │  Public catalog (CRUD)
│  (Catalog)      │  Interface for listing and editing
└─────────────────┘
```

## Queue System (Worker)

```
┌─────────────┐     CLAIM     ┌─────────────────┐
│  fila_      │ ◄──────────── │   Worker        │
│  processamento│             │ (worker.ts)      │
│              │ ────────►    │                  │
│ Status:      │  RESULT      │ processNextJob() │
│ - pendente   │             │ runWorkerBatch() │
│ - processando│             └──────────────────┘
│ - concluido  │
│ - erro       │    After 3 failures:
│ - falha_     │    ──────────► DLQ (Dead Letter Queue)
│   critica    │
└─────────────┘
```

## Resilience Cascade (AI/Scraping)

```
Tier 1 (Primary)
    │ fail
    ▼
Tier 2 (Backup 1)
    │ fail
    ▼
Tier 3 (Backup 2)
    │ fail
    ▼
Tier 4 (Backup 3)
    │ fail
    ▼
Tier 5 (Final Fallback)
```

## Database (Turso SQLite)

```
┌────────────────┐
│   Produtos     │ ◄────┐
│ (catalog)      │      │
└────────────────┘      │
       │                │
       ▼                │
┌────────────────┐      │
│   Reviews      │      │ (1:N)
│ (M3 analyses)  │      │
└────────────────┘      │
       │                │
       ▼                │
┌────────────────┐      │
│   Afiliados    │      │ (1:N)
│ (stores M5/M6) │      │
└────────────────┘      │
                       │
┌────────────────┐      │
│ config_ai_     │      │
│ models         │      │ (M8 config)
└────────────────┘      │
                       │
┌────────────────┐      │
│ config_scraping│      │
│ _services      │      │ (M8 config)
└────────────────┘      │
                       │
┌────────────────┐      │
│ fila_          │      │
│ processamento  │      │ (worker)
└────────────────┘      │
                       │
┌────────────────┐      │
│ logs_entrada   │      │ (audit)
└────────────────┘      │
                       │
┌────────────────┐      │
│ historico_     │      │
│ precos         │      │ (90 days)
└────────────────┘      │
```

## M9 Data Flow (Documentation)

```
/src/app/docs/
     │
     ├── page.tsx (UI: Sidebar + Reader)
     │
     ├── Reads .md files:
     │   ├── README.md (root)
     │   ├── API.md
     │   ├── ARCHITECTURE.md
     │   ├── CONTRIBUTING.md
     │   ├── CHANGELOG.md
     │   └── docs/**/*.md
     │
     └── Rendering: react-markdown + remark-gfm
```
