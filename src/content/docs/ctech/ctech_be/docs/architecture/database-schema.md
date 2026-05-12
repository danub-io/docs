---
title: "Database Schema — Turso (SQLite)"
---

This document describes all tables, indexes, and relationships in the Turso database shared between the backend (ctech_be) and frontend (ctech_fe).

## Overview

The database is a serverless SQLite managed by Turso. The backend writes data via Server Actions + Drizzle ORM, and the frontend reads directly in SSR via `@libsql/client`.

## Tables

### `Produtos`

Central table. Each row represents a hardware product curated by the ecosystem.

| Column | Type | Description |
|--------|------|-------------|
| `id` | INTEGER PK | Auto increment |
| `nome_produto` | TEXT NOT NULL | Product name |
| `marca` | TEXT NOT NULL | Manufacturer |
| `slug` | TEXT | Unique slug for URL (e.g. `sony-wh-1000xm5`) |
| `specs_json` | TEXT NOT NULL | Technical specifications in JSON |
| `tier` | TEXT NOT NULL | Tier: `Premium`, `Intermediario`, `CustoBeneficio` |
| `categoria` | TEXT | Product category (e.g. `Notebook`, `Fone`) |
| `lancamento` | TEXT | Release year |
| `nota_final` | REAL | Final compiled score (0-10) |
| `imagem_url` | TEXT | Product image URL |
| `status` | TEXT DEFAULT `rascunho` | `rascunho` → `AprovadoM3` → `AprovadoM4` |
| `review_ia` | TEXT | AI-generated review |
| `pros_gerais` / `contras_gerais` | TEXT | Consolidated pros and cons |
| `congelar_precos` | INTEGER DEFAULT 0 | If `1`, prices are not automatically updated |

**Indexes:** `status`, `categoria`, `tier`, `slug`, `nota_final`, `LOWER(nome_produto)`

### `Reviews`

Press (`critic`) and user (`user`) reviews for each product.

| Column | Type | Description |
|--------|------|-------------|
| `id` | INTEGER PK | Auto increment |
| `produto_id` | INTEGER FK → Produtos.id | Related product |
| `review_type` | TEXT DEFAULT `critic` | `critic` (press) or `user` (user) |
| `site` | TEXT | Site/source name |
| `link` | TEXT | Original review URL |
| `snippet` | TEXT | Review excerpt |
| `nota_review` | REAL | Assigned score |
| `pros` / `contras` | TEXT | Pros and cons mentioned |
| `is_approved` | INTEGER DEFAULT 0 | If `1`, approved for display |

**Indexes:** `produto_id`, `(produto_id, review_type)`

### `Afiliados`

Affiliate links (stores/partners) for each product.

| Column | Type | Description |
|--------|------|-------------|
| `id` | INTEGER PK | Auto increment |
| `produto_id` | INTEGER FK → Produtos.id | Related product |
| `loja` | TEXT | Store name (e.g. `Amazon`, `Kabum`) |
| `url_afiliado` | TEXT | Affiliate link |
| `preco_atual` | REAL | Current price |
| `ultima_atualizacao` | DATETIME | Last update timestamp |
| `nota_preco` | REAL | Price rating |
| `status_erro` / `precisa_revisao` | BOOLEAN | Error/review flags |
| `is_afiliado` | INTEGER | If `1`, it's an affiliate link (not direct) |
| `snippet` | TEXT | Remark about the offer |
| `link_original` | TEXT | Original URL before cleaning |

**Indexes:** `produto_id`, `loja`

### `Guias`

Editorial recommendation guides (RTINGS model). Groups products by topic.

| Column | Type | Description |
|--------|------|-------------|
| `id` | INTEGER PK | Auto increment |
| `slug` | TEXT UNIQUE NOT NULL | URL slug (`/guia/{slug}`) |
| `titulo` | TEXT NOT NULL | Guide title |
| `descricao` | TEXT | Short description (card) |
| `descricao_longa` | TEXT | Full editorial description |
| `imagem_url` | TEXT | Cover image URL |
| `categoria_pai` | TEXT NOT NULL | Related product category |
| `grupo` | TEXT DEFAULT '' | Thematic grouping (e.g. `Por Uso`, `Por Preço`) |
| `ordem` | INTEGER DEFAULT 0 | Display order |
| `ativo` | INTEGER DEFAULT 1 | If `0`, hidden from frontend |

**Indexes:** `slug` (unique), `(categoria_pai, ativo)`

### `Guia_Produtos`

Many-to-many relationship between guides and products.

| Column | Type | Description |
|--------|------|-------------|
| `guia_id` | INTEGER FK → Guias.id | Related guide |
| `produto_id` | INTEGER FK → Produtos.id | Related product |
| `ordem` | INTEGER DEFAULT 0 | Order within the guide |

**PK:** `(guia_id, produto_id)`
**Index:** `guia_id`

### `fila_processamento`

Backend async job queue (workers).

| Column | Type | Description |
|--------|------|-------------|
| `id` | INTEGER PK | Auto increment |
| `modulo` | TEXT NOT NULL | `link-review`, `busca-texto`, `busca-precos` |
| `referencia_id` | INTEGER NOT NULL | Target product/review ID |
| `status` | TEXT DEFAULT `pendente` | `pendente`, `processando`, `concluido`, `erro`, `falha_critica` |
| `tentativas` | INTEGER DEFAULT 0 | Attempt count (max 3 → DLQ) |
| `erro` | TEXT | Error message from last attempt |
| `prioridade` | INTEGER DEFAULT 0 | Job priority |

**Indexes:** `status`, `referencia_id`

### `historico_precos`

Price history for affiliates over time.

| Column | Type | Description |
|--------|------|-------------|
| `id` | INTEGER PK | Auto increment |
| `produto_id` | INTEGER FK → Produtos.id | Related product |
| `loja` | TEXT | Store name |
| `preco` | REAL | Captured price |
| `data_captura` | DATETIME | Capture timestamp |

**Index:** `(produto_id, data_captura)`

### `logs_entrada`

Detailed system logs (AI operations, scraping, errors).

| Column | Type | Description |
|--------|------|-------------|
| `id` | INTEGER PK | Auto increment |
| `timestamp` | DATETIME | Log time |
| `level` | TEXT | `info`, `warn`, `error` |
| `message` | TEXT | Log message |
| `details` | TEXT | Additional details (JSON) |
| `tokens_prompt` / `tokens_completion` | INTEGER | Tokens used (AI) |
| `model_id` | TEXT | AI model used |
| `custo_est` | REAL | Estimated operation cost |
| `module_name` | TEXT | Module that generated the log |
| `input_payload` | TEXT | Input payload |

**Index:** `timestamp`

### `conflitos_entrada`

Duplicate conflicts detected during ingestion (M1).

| Column | Type | Description |
|--------|------|-------------|
| `id` | INTEGER PK | Auto increment |
| `nome_produto` | TEXT NOT NULL | Conflicting product name |
| `marca` | TEXT | Brand |
| `dados_json` | TEXT NOT NULL | Full entry data |
| `motivo` | TEXT | Conflict reason |
| `match_candidato_id` | INTEGER | Candidate product ID |
| `status` | TEXT DEFAULT `pendente` | `pendente`, `resolvido`, `descartado` |

**Index:** `status`

### Configuration Tables

#### `config_ai_models`

Configured AI models (providers, keys, pricing).

| Column | Type |
|--------|------|
| `id` | INTEGER PK |
| `provider` | TEXT |
| `model_id` | TEXT |
| `api_key` | TEXT (AES-256-CBC encrypted) |
| `tier` | INTEGER DEFAULT 1 |
| `is_active` | INTEGER DEFAULT 1 |
| `system_prompt` | TEXT |
| `target_module` | TEXT |
| `input_price_1m` / `output_price_1m` | REAL |

#### `config_scraping_services`

Configured scraping services.

| Column | Type |
|--------|------|
| `id` | INTEGER PK |
| `name` | TEXT |
| `engine` | TEXT |
| `api_key` | TEXT |
| `tier` | INTEGER DEFAULT 1 |
| `is_active` | INTEGER DEFAULT 1 |

#### `config_preferences`

Global panel preferences (singleton, only 1 row).

| Column | Type |
|--------|------|
| `id` | INTEGER PK (always 1) |
| `theme` | TEXT DEFAULT `dark` |
| `show_scanlines` | INTEGER DEFAULT 1 |
| `animations_enabled` | INTEGER DEFAULT 1 |
| `compact_mode` | INTEGER DEFAULT 0 |

#### `worker_control`

Worker heartbeat control.

| Column | Type |
|--------|------|
| `id` | TEXT PK |
| `is_active` | INTEGER DEFAULT 0 |
| `last_heartbeat` | DATETIME |

## Migrations

Managed via Drizzle Kit. Migrations in `drizzle/migrations/`:

| Migration | Description |
|-----------|-------------|
| `0001_add_user_settings.sql` | Panel preferences |
| `0002_add_review_type.sql` | `review_type` column in Reviews |
| `0003_*` | Slug and indexes in Produtos |
| `0004_quick_mariko_yashida.sql` | Guides, Guide_Products tables, additional indexes |

Apply migrations:
```bash
pnpm exec drizzle-kit push
```

## Relationships (ER)

```
Produtos ──1:N──→ Reviews        (via produto_id)
Produtos ──1:N──→ Afiliados      (via produto_id)
Produtos ──1:N──→ historico_precos (via produto_id)
Produtos ──M:N──→ Guias           (via Guia_Produtos)
Guias ────1:N──→ Guia_Produtos   (via guia_id)
```
