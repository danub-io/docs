---
title: "Database Schema (Consolidated)"
description: "Tables, indexes, and relationships of the shared Turso database between ctech_be and ctech_fe"
---

The CTECH ecosystem uses a single shared **Turso (distributed SQLite)** database, shared between the backend (write) and frontend (SSR read).

> Original documentation: [ctech_be/docs/architecture/database-schema.md](ctech_be/docs/architecture/database-schema.md)

---

## Table: Produtos

Central catalog table.

| Column | Type | Description |
|--------|------|-------------|
| `id` | INTEGER PK | Auto increment |
| `nome_produto` | TEXT NOT NULL | Product name |
| `marca` | TEXT NOT NULL | Manufacturer |
| `slug` | TEXT | Unique slug for URL (e.g., `sony-wh-1000xm5`) |
| `specs_json` | TEXT NOT NULL | Technical specifications in JSON |
| `tier` | TEXT NOT NULL | Tier: `Premium`, `Intermediario`, `CustoBeneficio` |
| `categoria` | TEXT | Category (e.g., `Notebook`, `Fone`) |
| `lancamento` | TEXT | Release year |
| `nota_final` | REAL | Compiled final score (0-10) |
| `imagem_url` | TEXT | Product image URL |
| `status` | TEXT DEFAULT `rascunho` | `rascunho` -> `AprovadoM3` -> `AprovadoM4` |
| `review_ia` | TEXT | AI-generated review |
| `pros_gerais` / `contras_gerais` | TEXT | Consolidated pros and cons |
| `congelar_precos` | INTEGER DEFAULT 0 | If `1`, prices are not updated automatically |

**Indexes:** `status`, `categoria`, `tier`, `slug`, `nota_final`, `LOWER(nome_produto)`

**Important for the frontend:** Only products with `status = 'AprovadoM4'` are displayed publicly.

---

## Table: Reviews

Press (`critic`) and user (`user`) reviews.

| Column | Type | Description |
|--------|------|-------------|
| `id` | INTEGER PK | Auto increment |
| `produto_id` | INTEGER FK -> Produtos.id | Related product |
| `review_type` | TEXT DEFAULT `critic` | `critic` (press) or `user` |
| `site` | TEXT | Site/source name |
| `link` | TEXT | Original review URL |
| `snippet` | TEXT | Review snippet |
| `nota_review` | REAL | Assigned score |
| `pros` / `contras` | TEXT | Mentioned pros and cons |
| `is_approved` | INTEGER DEFAULT 0 | If `1`, approved for display |

**Indexes:** `produto_id`, `(produto_id, review_type)`

---

## Table: Afiliados

Affiliate links (stores/partners) for each product.

| Column | Type | Description |
|--------|------|-------------|
| `id` | INTEGER PK | Auto increment |
| `produto_id` | INTEGER FK -> Produtos.id | Related product |
| `loja` | TEXT | Store name (e.g., `Amazon`, `Kabum`) |
| `url_afiliado` | TEXT | Affiliate link |
| `preco_atual` | REAL | Current price |
| `ultima_atualizacao` | DATETIME | Last update timestamp |
| `nota_preco` | REAL | Price rating |
| `status_erro` / `precisa_revisao` | BOOLEAN | Error/review flags |
| `is_afiliado` | INTEGER | If `1`, it's an affiliate link (not direct) |
| `snippet` | TEXT | Offer note |
| `link_original` | TEXT | Original URL before cleanup |

**Indexes:** `produto_id`, `loja`

---

## Table: Guias

Editorial recommendation guides (RTINGS-style).

| Column | Type | Description |
|--------|------|-------------|
| `id` | INTEGER PK | Auto increment |
| `slug` | TEXT UNIQUE NOT NULL | Slug for URL (`/guia/{slug}`) |
| `titulo` | TEXT NOT NULL | Guide title |
| `descricao` | TEXT | Short description (card) |
| `descricao_longa` | TEXT | Full editorial description |
| `imagem_url` | TEXT | Cover image URL |
| `categoria_pai` | TEXT NOT NULL | Related product category |
| `grupo` | TEXT DEFAULT '' | Thematic grouping (e.g., `Por Uso`, `Por Preco`) |
| `ordem` | INTEGER DEFAULT 0 | Display order |
| `ativo` | INTEGER DEFAULT 1 | If `0`, hidden from the frontend |

**Indexes:** `slug` (unique), `(categoria_pai, ativo)`

---

## Table: Guia_Produtos

Many-to-many relationship between guides and products.

| Column | Type | Description |
|--------|------|-------------|
| `guia_id` | INTEGER FK -> Guias.id | Related guide |
| `produto_id` | INTEGER FK -> Produtos.id | Related product |
| `ordem` | INTEGER DEFAULT 0 | Order within the guide |

**PK:** `(guia_id, produto_id)`
**Index:** `guia_id`

---

## Table: fila_processamento

Backend async jobs.

| Column | Type | Description |
|--------|------|-------------|
| `id` | INTEGER PK | Auto increment |
| `modulo` | TEXT NOT NULL | `link-review`, `busca-texto`, `busca-precos` |
| `referencia_id` | INTEGER NOT NULL | Target product/review ID |
| `status` | TEXT DEFAULT `pendente` | `pendente`, `processando`, `concluido`, `erro`, `falha_critica` |
| `tentativas` | INTEGER DEFAULT 0 | Number of attempts (max 3 -> DLQ) |
| `erro` | TEXT | Error message from the last attempt |
| `prioridade` | INTEGER DEFAULT 0 | Job priority |

**Indexes:** `status`, `referencia_id`

---

## Table: historico_precos

Historical prices from affiliates over time.

| Column | Type | Description |
|--------|------|-------------|
| `id` | INTEGER PK | Auto increment |
| `produto_id` | INTEGER FK -> Produtos.id | Related product |
| `loja` | TEXT | Store name |
| `preco` | REAL | Captured price |
| `data_captura` | DATETIME | Capture timestamp |

**Index:** `(produto_id, data_captura)`

---

## Configuration Tables (backend)

### config_ai_models

AI models with encrypted keys (AES-256-CBC). Columns: `id`, `provider`, `model_id`, `api_key`, `tier`, `is_active`, `system_prompt`, `target_module`, `input_price_1m`, `output_price_1m`.

### config_scraping_services

Scraping services. Columns: `id`, `name`, `engine`, `api_key`, `tier`, `is_active`.

### config_preferences

Panel preferences (singleton). Columns: `theme`, `show_scanlines`, `animations_enabled`, `compact_mode`.

### worker_control

Worker heartbeat. Columns: `id`, `is_active`, `last_heartbeat`.

---

## Table: logs_entrada

System audit log. Columns: `id`, `timestamp`, `level`, `message`, `details`, `tokens_prompt`, `tokens_completion`, `model_id`, `custo_est`, `module_name`, `input_payload`.

---

## Table: conflitos_entrada

Duplicate conflicts detected during ingestion. Columns: `id`, `nome_produto`, `marca`, `dados_json`, `motivo`, `match_candidato_id`, `status`.

---

## Relationships (ER)

```
Produtos --1:N--> Reviews        (via produto_id)
Produtos --1:N--> Afiliados      (via produto_id)
Produtos --1:N--> historico_precos (via produto_id)
Produtos --M:N--> Guias          (via Guia_Produtos)
Guias   --1:N--> Guia_Produtos  (via guia_id)
```
