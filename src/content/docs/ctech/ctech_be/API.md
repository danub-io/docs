---
title: "API Documentation - CTECH Panel (Backend)"
---

This document describes the **Server Actions** (Next.js App Router) and **API Routes** available in the project.

> **Cache Strategy:** List queries (`getAIModels`, `getScrapingServices`, `getProdutosParaConsolidar`, etc.) use an in-memory cache with a 5 to 10-minute TTL. The cache is automatically invalidated on mutations. To bypass, use `{ refresh: true }`.

## Table of Contents
1. [M1 - Entry (Ingestion)](#m1---entry-ingestion)
2. [M2 - Discovery (Reviews)](#m2---discovery-reviews)
3. [M3 - Extraction (Analysis)](#m3---extraction-analysis)
4. [M4 - Consolidation](#m4---consolidation)
5. [M5 - Prices](#m5---prices)
6. [M6 - Checkout](#m6---checkout)
7. [M7 - CMS](#m7---cms)
8. [M8 - Settings](#m8---settings)
9. [M8.5 - Maintenance (Purge)](#m85---maintenance-purge)
10. [M9 - Documentation](#m9---documentation)
11. [Worker & Queue](#worker--queue)
12. [Utilities](#utilities)
13. [API Routes](#api-routes)

---

## M1 - Entry (Ingestion)

### `processarIngestao(textobruto, categoriaForcada?)`
Processes raw text using AI to extract products and check for duplicates.

**Parameters:**
- `textobruto` (string): Text containing product data (minimum 10 characters)
- `categoriaForcada` (string, optional): Forced category for the products

**Returns:** `ResultadoIngestao`
```typescript
{
  sucesso: boolean;
  total: number;
  inseridos: number;
  duplicados: number;
  erros: number;
  itens: ResultadoItem[];
  erro?: string;
}
```

### `salvarProdutoUnico(nb, conflitoId?)`
Manually saves a product identified as unique.

**Parameters:**
- `nb` (object): Product data (brand, product_name, raw_specs, tier)
- `conflitoId` (number, optional): ID of the conflict to resolve

### `getConflitos()`
Returns a list of pending entry conflicts.

### `descartarConflito(id)`
Discards an entry conflict.

**Parameters:**
- `id` (number): Conflict ID

---

## M2 - Discovery (Reviews)

### `processarScrapingReviews(produtoIds)`
Searches the web for reviews on products that don't have any yet.

**Parameters:**
- `produtoIds` (number[]): IDs of the products to search reviews for

**Returns:** `ScrapingStats`
```typescript
{
  sucesso: boolean;
  totalProcessados: number;
  totalReviewsEncontradas: number;
  creditosGastos: number;
  erro?: string;
  detalhes: Array<{
    id: number;
    nome: string;
    encontradas: number;
    status: "ok" | "erro" | "fallback";
    engineUsed?: string;
    aiUsed?: string;
    reviews: Array<{ id: number; site: string; link: string; snippet: string }>;
  }>;
}
```

### `getProdutosSemReview()`
Returns products that don't have reviews yet.

**Returns:** `ProdutoSemReview[]`

### `getReviewsPendentes()`
Returns reviews pending approval.

**Returns:** `ScrapingStats | null`

### `aprovarReview(id)`
Approves a review for processing.

**Parameters:**
- `id` (number): Review ID
- `produtoId` (number): Product ID

### `reprovarReview(reviewId, produtoId)`
Marks a review as rejected.

**Parameters:**
- `reviewId` (number): Review ID
- `produtoId` (number): Product ID

### `deletarReview(reviewId, produtoId)`
Deletes a review from the database.

**Parameters:**
- `reviewId` (number): Review ID
- `produtoId` (number): Product ID

### `aprovarTodasReviewsDoProduto(produtoId)`
Approves all reviews for a specific product.

**Parameters:**
- `produtoId` (number): Product ID

### `aprovarAbsolutamenteTodasReviews()`
Approves all pending reviews in the system.

---

## M3 - Extraction (Analysis)

### `processarTextoReview(reviewId, forcedModelId?)`
Extracts review content and analyzes it with AI.

**Parameters:**
- `reviewId` (number): Review ID
- `forcedModelId` (number, optional): Specific AI model ID

**Returns:**
```typescript
{
  sucesso: boolean;
  result?: {
    is_match: boolean;
    nota_review: number;
    pros: string;
    contras: string;
    mini_review: string;
    specs_extraidas?: Record<string, string>;
  };
  erro?: string;
}
```

### `getProdutosParaBuscaReview()`
Lists products with approved but uncurated reviews.

**Returns:** `ProdutoReviewStatus[]`

### `getDetalhesProdutoReview(id)`
Gets full details of a product and its reviews.

**Parameters:**
- `id` (number): Product ID

**Returns:** `ProdutoDetalhado | null`

### `aprovarProdutoM3(produtoId)`
Marks a product as approved in M3.

**Parameters:**
- `produtoId` (number): Product ID

### `aprovarProdutosEmLoteM3(produtoIds)`
Approves multiple products in M3 in batch.

**Parameters:**
- `produtoIds` (number[]): Array of IDs

### `enqueueAllBuscaTextoReviews()`
Enqueues all reviews pending extraction.

### `salvarAvaliacaoManual(reviewId, produtoId, nota, pros, contras)`
Saves a manual review evaluation.

**Parameters:**
- `reviewId` (number): Review ID
- `produtoId` (number): Product ID
- `nota` (number): Score from 0 to 10
- `pros` (string): Positive points
- `contras` (string): Negative points

### `atualizarMetadadosProduto(produtoId, lancamento, specs_json)`
Updates product metadata.

**Parameters:**
- `produtoId` (number): Product ID
- `lancamento` (string | null): Release date
- `specs_json` (string): Specifications in JSON

### `adicionarAfiliado(produtoId, loja, url_afiliado, preco_atual)`
Manually adds an affiliate link.

**Parameters:**
- `produtoId` (number): Product ID
- `loja` (string): Store name
- `url_afiliado` (string): Affiliate URL
- `preco_atual` (number): Current price

### `deletarAfiliado(afiliadoId, produtoId)`
Deletes an affiliate link.

**Parameters:**
- `afiliadoId` (number): Affiliate ID
- `produtoId` (number): Product ID

### `deletarProduto(id)`
Deletes a product and related data (transaction).

**Parameters:**
- `id` (number): Product ID

---

## M4 - Consolidation

### `processarConsolidacao(produtoId, modelId?)`
Consolidates reviews for a product using AI.

**Parameters:**
- `produtoId` (number): Product ID
- `modelId` (number, optional): AI model ID

**Returns:**
```typescript
{
  sucesso: boolean;
  nota?: number;
  erro?: string;
}
```

### `processarConsolidacaoLote(produtoIds)`
Processes batch consolidation.

**Parameters:**
- `produtoIds` (number[]): Array of IDs

### `getProdutosParaConsolidar()`
Lists products with valid reviews ready for consolidation.

**Returns:** `ProdutoParaConsolidar[]`

### `aprovarProdutosM4(ids)`
Approves products in M4.

**Parameters:**
- `ids` (number[]): Array of IDs

### `atualizarVereditoManual(produtoId, review, pros, contras)`
Manually updates a verdict.

**Parameters:**
- `produtoId` (number): Product ID
- `review` (string): Verdict text
- `pros` (string): Positive points
- `contras` (string): Negative points

---

## M5 - Prices

### `buscarPrecosEmLote(produtoId?)`
Fetches prices for products approved in M4.

**Parameters:**
- `produtoId` (number, optional): Specific product ID (if omitted, fetches up to 10 products)

**Returns:**
```typescript
{
  sucesso: boolean;
  meta?: { total: number; atualizados: number };
  mensagem?: string;
  erro?: string;
}
```

### `getAfiliadosExistentes(limit?, offset?)`
Lists saved affiliate links (paginated).

**Parameters:**
- `limit` (number, default 20): Result limit
- `offset` (number, default 0): Pagination offset

**Returns:** `LinkAfiliadoSalvo[]`

### `getProdutosPendentesPreco()`
Lists products awaiting price lookup.

### `toggleCongelamentoPreco(produtoId, congelar)`
Freezes/unfreezes price updates for a product.

**Parameters:**
- `produtoId` (number): Product ID
- `congelar` (boolean): True to freeze

### `salvarLinkManual(produtoId, url)`
Manually saves an affiliate link.

**Parameters:**
- `produtoId` (number): Product ID
- `url` (string): Affiliate URL

### `deletarAfiliado(id)`
Removes an affiliate link.

**Parameters:**
- `id` (number): Affiliate ID

---

## M6 - Checkout

### `getDadosConferenciaPorLoja()`
Returns checkout data grouped by store.

**Returns:** `LojaConferencia[]`
```typescript
{
  nome: string;
  total_produtos: number;
  total_alertas: number;
  produtos: AfiliadoInfo[];
}
```

### `getAfiliadosConferencia()`
Lists all affiliates for checkout audit.

### `atualizarLinkAfiliado(id, url)`
Updates an affiliate URL.

**Parameters:**
- `id` (number): Affiliate ID
- `url` (string): New URL

### `atualizarPrecoIndividual(afiliadoId)`
Updates the price of a single affiliate via scraping + AI.

**Parameters:**
- `afiliadoId` (number): Affiliate ID

### `limparUrlServidor(url)`
Cleans tracking parameters from a URL.

**Parameters:**
- `url` (string): Original URL

### `limparTodosLinksNaoLimpos()`
Cleans all URLs that haven't been processed yet.

### `conferirTodosAfiliados()`
Starts a full affiliate checkout audit.

### `getUrlCleanerConfigs()`
Lists URL cleaner configurations.

### `upsertUrlCleanerConfig(pattern, tipo, descricao)`
Adds or updates a URL cleaner configuration.

**Parameters:**
- `pattern` (string): Store pattern
- `tipo` (string): Cleaning type
- `descricao` (string): Description

### `toggleUrlCleanerConfig(id, ativo)`
Enables or disables a URL cleaner configuration.

**Parameters:**
- `id` (number): Configuration ID
- `ativo` (boolean): Status

---

## M7 - CMS

### `getProdutosAction(filters)`
Queries products with filters.

**Parameters:**
- `filters` (object): `{ categoria?, marca?, lancamento? }`

### `getFiltrosAction()`
Returns available filter options (categories, brands).

### `updateProdutoAction(id, data)`
Updates a product's data.

**Parameters:**
- `id` (number): Product ID
- `data` (Partial<Produto>): Fields to update

### `deleteProdutoAction(id)`
Removes a product via CMS.

**Parameters:**
- `id` (number): Product ID

---

## M8 - Settings

### AI Models (`ai-models.ts`)

#### `getAIModels(module?, onlyActive?, limit?, offset?)`
Lists configured AI models.

**Parameters:**
- `module` (AIModule, optional): Filter by module (`"entrada" | "descoberta" | "extracao" | "consolidacao" | "precos" | "conferencia"`)
- `onlyActive` (boolean, default true): Return only active models
- `limit` (number, optional): Result limit
- `offset` (number, optional): Pagination offset

**Returns:** `AIModel[]`
```typescript
{
  id?: number;
  provider: string;
  model_id: string;
  api_key: string; // decrypted
  system_prompt: string;
  target_module: AIModule;
  tier: number;
  is_active?: boolean;
}
```

#### `upsertAIModel(data)`
Creates or updates an AI model (UPSERT). API keys are encrypted with AES-256-CBC.

**Parameters:**
- `data` (Partial<AIModel>): `{ id? (number), provider (string), model_id (string), api_key (string), system_prompt? (string), target_module (AIModule), tier (1-5), is_active? (boolean) }`

**Returns:** `{ sucesso: boolean; success: boolean }`

#### `deleteAIModel(id)`
Deletes an AI model.

**Parameters:**
- `id` (number): Model ID

**Returns:** `{ sucesso: boolean; success: boolean }`

#### `toggleAIModel(id, active)`
Enables or disables a specific model.

**Parameters:**
- `id` (number): Model ID
- `active` (boolean): New status

**Returns:** `{ sucesso: boolean; success: boolean }`

#### `toggleAllAIModels(module, active)`
Enables or disables all models in a module.

**Parameters:**
- `module` (string): Module name
- `active` (boolean): New status

**Returns:** `{ sucesso: boolean; success: boolean }`

#### `getDefaultPrompt(module)`
Returns the default prompt for a module.

**Parameters:**
- `module` (AIModule): Target module

**Returns:** `string` (default prompt or custom one saved in the database)

---

### Scraping Services (`scraping-services.ts`)

#### `getScrapingServices(module?, onlyActive?)`
Lists configured scraping services.

**Parameters:**
- `module` (string, optional): Filter by module (`"descoberta" | "extracao" | "precos" | "conferencia"`)
- `onlyActive` (boolean, default true): Return only active services

**Returns:** `ScrapingService[]`
```typescript
{
  id?: number;
  name: string;
  engine: string;
  api_key: string; // decrypted
  scraping_code?: string;
  target_module: string;
  tier: number;
  is_active?: boolean;
}
```

#### `upsertScrapingService(data)`
Creates or updates a scraping service (UPSERT).

**Parameters:**
- `data` (Partial<ScrapingService>): `{ id? (number), name (string), engine (string), api_key (string), scraping_code? (string), target_module (string), tier (1-5), is_active? (boolean) }`

**Returns:** `{ sucesso: boolean; success: boolean }`

#### `deleteScrapingService(id)`
Deletes a scraping service.

**Parameters:**
- `id` (number): Service ID

**Returns:** `{ sucesso: boolean; success: boolean }`

#### `toggleScrapingService(id, active)`
Enables or disables a specific service.

**Parameters:**
- `id` (number): Service ID
- `active` (boolean): New status

**Returns:** `{ sucesso: boolean; success: boolean }`

#### `toggleAllScrapingServices(module, active)`
Enables or disables all services in a module.

**Parameters:**
- `module` (string): Module name
- `active` (boolean): New status

**Returns:** `{ sucesso: boolean; success: boolean }`

---

### Logs (`logs.ts`)

#### `getIngestionLogs(limit?)`
Lists ingestion logs (default 50 records, ordered by timestamp DESC).

**Parameters:**
- `limit` (number, default 50): Number of records

**Returns:** `LogEntry[]`
```typescript
{
  id: number;
  timestamp: string;
  level: string;
  message: string;
  details: string | null;
  tokens_prompt: number;
  tokens_completion: number;
  model_id: string | null;
  custo_est: number;
  module_name: string | null;
  input_payload: string | null;
}
```

#### `getLatestLogForModule(module)`
Returns the 10 most recent logs for a module.

**Parameters:**
- `module` (string): Module name

**Returns:** `LogEntry[]`

#### `addIngestionLog(level, title, message, prompt_tokens?, completion_tokens?, model_used?, target_module?, payload?)`
Manually adds a log entry.

**Parameters:**
- `level` (`"info" | "warning" | "error"`)
- `title` (string): Log title
- `message` (string): Detailed message
- `prompt_tokens` (number, default 0)
- `completion_tokens` (number, default 0)
- `model_used` (string, optional)
- `target_module` (string, optional)
- `payload` (string, optional)

**Returns:** `{ sucesso: boolean; success: boolean }`

#### `clearLogs()`
Clears all ingestion logs.

**Returns:** `{ sucesso: boolean; success: boolean }`

#### `getTelemetriaStats()`
Returns usage statistics (top 5 models and scrapers).

**Returns:** `TelemetriaStats`
```typescript
{
  topModels: { model_id: string; provider: string; calls: number; total_tokens: number }[];
  topScrapers: { name: string; engine: string; calls: number }[];
}
```

---

### Preferences (`preferences.ts`)

#### `getUserPreferences()`
Gets user preferences (stored in cookies).

**Returns:** `UserPreferences`
```typescript
{
  theme: string; // default: "dark"
  show_scanlines: boolean;
  animations_enabled: boolean;
  compact_mode: boolean;
  auto_refresh: boolean;
}
```

#### `updateUserPreferences(prefs)`
Updates user preferences (merges with current values).

**Parameters:**
- `prefs` (Partial<UserPreferences>): Fields to update

**Returns:** `UserPreferences` (updated preferences)

---

## M8.5 - Maintenance (Purge)

Cleanup and maintenance functions for the database, available at `/8-configuracoes/manutencao`.

### `limparLogsSistema(meses)`
Removes system logs older than the specified period.

**Parameters:**
- `meses` (number, default 1): Keep the last N months

**Returns:** `{ sucesso: boolean; registros: number }`

### `limparFilaProcessamento(dias)`
Removes completed or errored queue jobs older than the specified period.

**Parameters:**
- `dias` (number, default 7): Keep the last N days

**Returns:** `{ sucesso: boolean; registros: number }`

### `limparHistoricoPrecos(dias)`
Removes price history records older than the specified period.

**Parameters:**
- `dias` (number, default 90): Keep the last N days

**Returns:** `{ sucesso: boolean; registros: number }`

### `limparConflitosEntrada(dias)`
Removes resolved entry conflicts older than the specified period.

**Parameters:**
- `dias` (number, default 30): Keep the last N days

**Returns:** `{ sucesso: boolean; registros: number }`

### `executarPurgeCompleta()`
Runs all purge functions above in sequence and revalidates the cache.

**Returns:**
```typescript
{
  sucesso: boolean;
  resultados: {
    logs: number;
    fila: number;
    precos: number;
    conflitos: number;
  };
}
```

---

## M9 - Documentation

Module for viewing Markdown documentation embedded in the panel.

### Features
- Renders `.md` files via `react-markdown` + `remark-gfm`
- Full-text search across documentation
- Section navigation (Sidebar)

### Server Actions
M9 is a read-only module (UI-only). It has no Server Actions of its own beyond static file rendering.

---

## Worker & Queue

### `processNextJob()`
Processes the next job in the queue (`fila_processamento`). Atomically claims it and executes the task according to the module:
- `descoberta`: `processarScrapingReviews()`
- `extracao`: `processarTextoReview()`
- `consolidacao`: `processarConsolidacao()`
- `precos`: `atualizarPrecoIndividual()`

Timeout: `WORKER_JOB_TIMEOUT_MS` (defined in `@/lib/constants`).

**Returns:**
```typescript
{ job: string | null; status?: "sucesso" | "erro"; erro?: string }
```

### `runWorkerBatch(limit?)`
Processes a batch of jobs sequentially.

**Parameters:**
- `limit` (number, default 5): Maximum jobs to process

**Returns:**
```typescript
{ processados: number; results: Array<{ job: string; status: string; erro?: string }> }
```

---

## Utilities

### `getSetting(key)`
Gets a global setting from the database (`userSettings`).

**Parameters:**
- `key` (string): Setting key

**Returns:** `any` (parsed as JSON, or as string, or `null` if it doesn't exist)

### `setSetting(key, value)`
Saves or updates a global setting (UPSERT).

**Parameters:**
- `key` (string): Setting key
- `value` (any): Value (serialized as JSON)

### `atualizarPrecosComIA()`
Updates prices for all affiliates using AI as a fallback.

**Logic:**
1. Attempts extraction via free CSS selectors (Mercado Livre, Amazon, Magazine Luiza, Kabum)
2. If that fails, uses AI (model configured in M8) to extract the price from the HTML
3. Updates `preco_atual` and records it in `historico_precos`
4. Automatic cleanup: removes records older than 90 days

**Returns:** `{ sucesso: boolean; mensagem?: string; erro?: string }`

---

## API Routes

### `GET /api/health`
Checks application health and connections.

**Success Response (200):**
```json
{
  "status": "ok",
  "db": "connected",
  "worker": {
    "active": true,
    "lastHeartbeat": "2026-05-01T10:00:00.000Z"
  }
}
```

**Error Response (500):**
```json
{
  "status": "error",
  "db": "disconnected",
  "message": "Internal server error"
}
```

---

## Usage Patterns

### Validation
All Server Actions use `validateAction()` to check authentication/authorization.

### Error Handling
Standard return pattern:
```typescript
{ sucesso: boolean; erro?: string; ... }
```

### Cache Revalidation
After mutations, `revalidatePath()` is used to update the UI.

### Typing
All types are defined in the action files or in `src/types/db.ts`.
