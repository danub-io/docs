---
title: "API Documentation - CTECH Painel (Backend)"
---



Este documento descreve as **Server Actions** (Next.js App Router) e **API Routes** disponíveis no projeto.

## Índice
1. [M1 - Entrada (Ingestão)](#m1---entrada-ingestão)
2. [M2 - Descoberta (Reviews)](#m2---descoberta-reviews)
3. [M3 - Extração (Análise)](#m3---extração-análise)
4. [M4 - Consolidação](#m4---consolidação)
5. [M5 - Preços](#m5---preços)
6. [M6 - Conferência](#m6---conferência)
7. [M7 - CMS](#m7---cms)
8. [M8 - Configurações](#m8---configurações)
9. [M9 - Documentação](#m9---documentação)
10. [Worker & Queue](#worker--queue)
11. [Utilitários](#utilitários)
12. [API Routes](#api-routes)

---

## M1 - Entrada (Ingestão)

### `processarIngestao(textobruto, categoriaForcada?)`
Processa texto bruto usando IA para extrair produtos e verificar duplicidade.

**Parâmetros:**
- `textobruto` (string): Texto contendo dados dos produtos (mínimo 10 caracteres)
- `categoriaForcada` (string, opcional): Categoria forçada para os produtos

**Retorno:** `ResultadoIngestao`
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
Salva manualmente um produto identificado como único.

**Parâmetros:**
- `nb` (object): Dados do produto (marca, nome_produto, specs_cru, tier)
- `conflitoId` (number, opcional): ID do conflito a ser resolvido

### `getConflitos()`
Retorna lista de conflitos de entrada pendentes.

### `descartarConflito(id)`
Descarta um conflito de entrada.

**Parâmetros:**
- `id` (number): ID do conflito

---

## M2 - Descoberta (Reviews)

### `processarScrapingReviews(produtoIds)`
Executa busca de reviews na web para produtos sem review.

**Parâmetros:**
- `produtoIds` (number[]): IDs dos produtos para buscar reviews

**Retorno:** `ScrapingStats`
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
Retorna produtos que ainda não possuem reviews.

**Retorno:** `ProdutoSemReview[]`

### `getReviewsPendentes()`
Retorna reviews pendentes de aprovação.

**Retorno:** `ScrapingStats | null`

### `aprovarReview(id)`
Aprova uma review para processamento.

**Parâmetros:**
- `id` (number): ID da review
- `produtoId` (number): ID do produto

### `reprovarReview(reviewId, produtoId)`
Marca uma review como reprovada.

**Parâmetros:**
- `reviewId` (number): ID da review
- `produtoId` (number): ID do produto

### `deletarReview(reviewId, produtoId)`
Remove uma review do banco.

**Parâmetros:**
- `reviewId` (number): ID da review
- `produtoId` (number): ID do produto

### `aprovarTodasReviewsDoProduto(produtoId)`
Aprova todas as reviews de um produto específico.

**Parâmetros:**
- `produtoId` (number): ID do produto

### `aprovarAbsolutamenteTodasReviews()`
Aprova todas as reviews pendentes no sistema.

---

## M3 - Extração (Análise)

### `processarTextoReview(reviewId, forcedModelId?)`
Extrai conteúdo da review e analisa com IA.

**Parâmetros:**
- `reviewId` (number): ID da review
- `forcedModelId` (number, opcional): ID do modelo de IA específico

**Retorno:**
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
Lista produtos com reviews aprovadas mas não curadas.

**Retorno:** `ProdutoReviewStatus[]`

### `getDetalhesProdutoReview(id)`
Obtém detalhes completos de um produto e suas reviews.

**Parâmetros:**
- `id` (number): ID do produto

**Retorno:** `ProdutoDetalhado | null`

### `aprovarProdutoM3(produtoId)`
Marca produto como aprovado no M3.

**Parâmetros:**
- `produtoId` (number): ID do produto

### `aprovarProdutosEmLoteM3(produtoIds)`
Aprova múltiplos produtos no M3 em lote.

**Parâmetros:**
- `produtoIds` (number[]): Array de IDs

### `enqueueAllBuscaTextoReviews()`
Enfileira todas as reviews pendentes de extração.

### `salvarAvaliacaoManual(reviewId, produtoId, nota, pros, contras)`
Salva avaliação manual de uma review.

**Parâmetros:**
- `reviewId` (number): ID da review
- `produtoId` (number): ID do produto
- `nota` (number): Nota de 0 a 10
- `pros` (string): Pontos positivos
- `contras` (string): Pontos negativos

### `atualizarMetadadosProduto(produtoId, lancamento, specs_json)`
Atualiza metadados do produto.

**Parâmetros:**
- `produtoId` (number): ID do produto
- `lancamento` (string | null): Data de lançamento
- `specs_json` (string): Especificações em JSON

### `adicionarAfiliado(produtoId, loja, url_afiliado, preco_atual)`
Adiciona link de afiliado manual.

**Parâmetros:**
- `produtoId` (number): ID do produto
- `loja` (string): Nome da loja
- `url_afiliado` (string): URL do afiliado
- `preco_atual` (number): Preço atual

### `deletarAfiliado(afiliadoId, produtoId)`
Remove um afiliado.

**Parâmetros:**
- `afiliadoId` (number): ID do afiliado
- `produtoId` (number): ID do produto

### `deletarProduto(id)`
Deleta produto e dados relacionados (transaction).

**Parâmetros:**
- `id` (number): ID do produto

---

## M4 - Consolidação

### `processarConsolidacao(produtoId, modelId?)`
Consolida reviews de um produto usando IA.

**Parâmetros:**
- `produtoId` (number): ID do produto
- `modelId` (number, opcional): ID do modelo de IA

**Retorno:**
```typescript
{
  sucesso: boolean;
  nota?: number;
  erro?: string;
}
```

### `processarConsolidacaoLote(produtoIds)`
Processa consolidação em lote.

**Parâmetros:**
- `produtoIds` (number[]): Array de IDs

### `getProdutosParaConsolidar()`
Lista produtos com reviews válidas para consolidação.

**Retorno:** `ProdutoParaConsolidar[]`

### `aprovarProdutosM4(ids)`
Aprova produtos no M4.

**Parâmetros:**
- `ids` (number[]): Array de IDs

### `atualizarVereditoManual(produtoId, review, pros, contras)`
Atualiza veredito manualmente.

**Parâmetros:**
- `produtoId` (number): ID do produto
- `review` (string): Texto do veredito
- `pros` (string): Pontos positivos
- `contras` (string): Pontos negativos

---

## M5 - Preços

### `buscarPrecosEmLote(produtoId?)`
Busca preços para produtos aprovados no M4.

**Parâmetros:**
- `produtoId` (number, opcional): ID específico (se omitido, busca até 10 produtos)

**Retorno:**
```typescript
{
  sucesso: boolean;
  meta?: { total: number; atualizados: number };
  mensagem?: string;
  erro?: string;
}
```

### `getAfiliadosExistentes(limit?, offset?)`
Lista links de afiliados salvos (paginação).

**Parâmetros:**
- `limit` (number, padrão 20): Limite de resultados
- `offset` (number, padrão 0): Offset para paginação

**Retorno:** `LinkAfiliadoSalvo[]`

### `getProdutosPendentesPreco()`
Lista produtos aguardando busca de preço.

### `toggleCongelamentoPreco(produtoId, congelar)`
Congela/descongela atualização de preços de um produto.

**Parâmetros:**
- `produtoId` (number): ID do produto
- `congelar` (boolean): True para congelar

### `salvarLinkManual(produtoId, url)`
Salva link de afiliado manualmente.

**Parâmetros:**
- `produtoId` (number): ID do produto
- `url` (string): URL do afiliado

### `deletarAfiliado(id)`
Remove afiliado da lixeira.

**Parâmetros:**
- `id` (number): ID do afiliado

---

## M6 - Conferência

### `getDadosConferenciaPorLoja()`
Retorna dados de conferência agrupados por loja.

**Retorno:** `LojaConferencia[]`
```typescript
{
  nome: string;
  total_produtos: number;
  total_alertas: number;
  produtos: AfiliadoInfo[];
}
```

### `getAfiliadosConferencia()`
Lista todos os afiliados para conferência.

### `atualizarLinkAfiliado(id, url)`
Atualiza URL de um afiliado.

**Parâmetros:**
- `id` (number): ID do afiliado
- `url` (string): Nova URL

### `atualizarPrecoIndividual(afiliadoId)`
Atualiza preço de um afiliado via scraping + IA.

**Parâmetros:**
- `afiliadoId` (number): ID do afiliado

### `limparUrlServidor(url)`
Limpa parâmetros de tracking de uma URL.

**Parâmetros:**
- `url` (string): URL original

### `limparTodosLinksNaoLimpos()`
Limpa todas as URLs que ainda não foram processadas.

### `conferirTodosAfiliados()`
Inicia conferência de todos os afiliados.

### `getUrlCleanerConfigs()`
Lista configurações do limpador de URLs.

### `upsertUrlCleanerConfig(pattern, tipo, descricao)`
Adiciona/atualiza configuração de limpeza de URL.

**Parâmetros:**
- `pattern` (string): Padrão da loja
- `tipo` (string): Tipo de limpeza
- `descricao` (string): Descrição

### `toggleUrlCleanerConfig(id, ativo)`
Ativa/desativa configuração de limpeza.

**Parâmetros:**
- `id` (number): ID da configuração
- `ativo` (boolean): Status

---

## M7 - CMS

### `getProdutosAction(filters)`
Busca produtos com filtros.

**Parâmetros:**
- `filters` (object): `{ categoria?, marca?, lancamento? }`

### `getFiltrosAction()`
Retorna opções de filtros disponíveis (categorias, marcas).

### `updateProdutoAction(id, data)`
Atualiza dados de um produto.

**Parâmetros:**
- `id` (number): ID do produto
- `data` (Partial<Produto>): Campos a atualizar

### `deleteProdutoAction(id)`
Remove um produto pelo CMS.

**Parâmetros:**
- `id` (number): ID do produto

---

## M8 - Configurações

### AI Models (`ai-models.ts`)

#### `getAIModels(module?, onlyActive?, limit?, offset?)`
Lista modelos de IA configurados.

**Parâmetros:**
- `module` (AIModule, opcional): Filtrar por módulo (`"entrada" | "descoberta" | "extracao" | "consolidacao" | "precos" | "conferencia"`)
- `onlyActive` (boolean, padrão true): Retornar apenas ativos
- `limit` (number, opcional): Limite de resultados
- `offset` (number, opcional): Offset para paginação

**Retorno:** `AIModel[]`
```typescript
{
  id?: number;
  provider: string;
  model_id: string;
  api_key: string; // descriptografada
  system_prompt: string;
  target_module: AIModule;
  tier: number;
  is_active?: boolean;
}
```

#### `upsertAIModel(data)`
Cria ou atualiza um modelo de IA (UPSERT). Chaves API são criptografadas com AES-256-CBC.

**Parâmetros:**
- `data` (Partial<AIModel>): `{ id? (number), provider (string), model_id (string), api_key (string), system_prompt? (string), target_module (AIModule), tier (1-5), is_active? (boolean) }`

**Retorno:** `{ sucesso: boolean; success: boolean }`

#### `deleteAIModel(id)`
Remove um modelo de IA.

**Parâmetros:**
- `id` (number): ID do modelo

**Retorno:** `{ sucesso: boolean; success: boolean }`

#### `toggleAIModel(id, active)`
Ativa/desativa um modelo específico.

**Parâmetros:**
- `id` (number): ID do modelo
- `active` (boolean): Novo status

**Retorno:** `{ sucesso: boolean; success: boolean }`

#### `toggleAllAIModels(module, active)`
Ativa/desativa todos os modelos de um módulo.

**Parâmetros:**
- `module` (string): Nome do módulo
- `active` (boolean): Novo status

**Retorno:** `{ sucesso: boolean; success: boolean }`

#### `getDefaultPrompt(module)`
Retorna o prompt padrão para um módulo.

**Parâmetros:**
- `module` (AIModule): Módulo alvo

**Retorno:** `string` (prompt padrão ou personalizado salvo no banco)

---

### Scraping Services (`scraping-services.ts`)

#### `getScrapingServices(module?, onlyActive?)`
Lista serviços de scraping configurados.

**Parâmetros:**
- `module` (string, opcional): Filtrar por módulo (`"descoberta" | "extracao" | "precos" | "conferencia"`)
- `onlyActive` (boolean, padrão true): Retornar apenas ativos

**Retorno:** `ScrapingService[]`
```typescript
{
  id?: number;
  name: string;
  engine: string;
  api_key: string; // descriptografada
  scraping_code?: string;
  target_module: string;
  tier: number;
  is_active?: boolean;
}
```

#### `upsertScrapingService(data)`
Cria ou atualiza um serviço de scraping (UPSERT).

**Parâmetros:**
- `data` (Partial<ScrapingService>): `{ id? (number), name (string), engine (string), api_key (string), scraping_code? (string), target_module (string), tier (1-5), is_active? (boolean) }`

**Retorno:** `{ sucesso: boolean; success: boolean }`

#### `deleteScrapingService(id)`
Remove um serviço de scraping.

**Parâmetros:**
- `id` (number): ID do serviço

**Retorno:** `{ sucesso: boolean; success: boolean }`

#### `toggleScrapingService(id, active)`
Ativa/desativa um serviço específico.

**Parâmetros:**
- `id` (number): ID do serviço
- `active` (boolean): Novo status

**Retorno:** `{ sucesso: boolean; success: boolean }`

#### `toggleAllScrapingServices(module, active)`
Ativa/desativa todos os serviços de um módulo.

**Parâmetros:**
- `module` (string): Nome do módulo
- `active` (boolean): Novo status

**Retorno:** `{ sucesso: boolean; success: boolean }`

---

### Logs (`logs.ts`)

#### `getIngestionLogs(limit?)`
Lista logs de ingestão (padrão 50 registros, ordenados por timestamp DESC).

**Parâmetros:**
- `limit` (number, padrão 50): Quantidade de registros

**Retorno:** `LogEntry[]`
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
Retorna os 10 logs mais recentes de um módulo.

**Parâmetros:**
- `module` (string): Nome do módulo

**Retorno:** `LogEntry[]`

#### `addIngestionLog(level, title, message, prompt_tokens?, completion_tokens?, model_used?, target_module?, payload?)`
Adiciona um log manual.

**Parâmetros:**
- `level` (`"info" | "warning" | "error"`)
- `title` (string): Título do log
- `message` (string): Mensagem detalhada
- `prompt_tokens` (number, padrão 0)
- `completion_tokens` (number, padrão 0)
- `model_used` (string, opcional)
- `target_module` (string, opcional)
- `payload` (string, opcional)

**Retorno:** `{ sucesso: boolean; success: boolean }`

#### `clearLogs()`
Limpa todos os logs de ingestão.

**Retorno:** `{ sucesso: boolean; success: boolean }`

#### `getTelemetriaStats()`
Retorna estatísticas de uso (top 5 modelos e scrapers).

**Retorno:** `TelemetriaStats`
```typescript
{
  topModels: { model_id: string; provider: string; calls: number; total_tokens: number }[];
  topScrapers: { name: string; engine: string; calls: number }[];
}
```

---

### Preferences (`preferences.ts`)

#### `getUserPreferences()`
Obtém preferências do usuário (armazenadas em cookies).

**Retorno:** `UserPreferences`
```typescript
{
  theme: string; // padrão: "dark"
  show_scanlines: boolean;
  animations_enabled: boolean;
  compact_mode: boolean;
  auto_refresh: boolean;
}
```

#### `updateUserPreferences(prefs)`
Atualiza preferências do usuário (merge com valores atuais).

**Parâmetros:**
- `prefs` (Partial<UserPreferences>): Campos a atualizar

**Retorno:** `UserPreferences` (preferências atualizadas)

---

## M9 - Documentação

Módulo para visualização de documentação Markdown integrada ao painel.

### Funcionalidades
- Renderização de arquivos `.md` via `react-markdown` + `remark-gfm`
- Busca textual integrada na documentação
- Navegação por seções (Sidebar)

### Server Actions
M9 é um módulo de leitura (UI-only). Não possui Server Actions próprias além da renderização de arquivos estáticos.

---

## Worker & Queue

### `processNextJob()`
Processa o próximo job na fila (`fila_processamento`). Faz claim atômico e executa a tarefa conforme o módulo:
- `descoberta`: `processarScrapingReviews()`
- `extracao`: `processarTextoReview()`
- `consolidacao`: `processarConsolidacao()`
- `precos`: `atualizarPrecoIndividual()`

Timeout: `WORKER_JOB_TIMEOUT_MS` (definido em `@/lib/constants`).

**Retorno:**
```typescript
{ job: string | null; status?: "sucesso" | "erro"; erro?: string }
```

### `runWorkerBatch(limit?)`
Processa um lote de jobs sequencialmente.

**Parâmetros:**
- `limit` (number, padrão 5): Máximo de jobs a processar

**Retorno:**
```typescript
{ processados: number; results: Array<{ job: string; status: string; erro?: string }> }
```

---

## Utilitários

### `getSetting(key)`
Obtém uma configuração global do banco (`userSettings`).

**Parâmetros:**
- `key` (string): Chave da configuração

**Retorno:** `any` (valor parseado como JSON, ou string, ou `null` se não existir)

### `setSetting(key, value)`
Salva/atualiza uma configuração global (UPSERT).

**Parâmetros:**
- `key` (string): Chave da configuração
- `value` (any): Valor (serializado como JSON)

### `atualizarPrecosComIA()`
Atualiza preços de todos os afiliados usando IA como fallback.

**Lógica:**
1. Tenta extração via seletores CSS gratuitos (Mercado Livre, Amazon, Magazine Luiza, Kabum)
2. Se falhar, usa IA (modelo configurado no M8) para extrair o preço do HTML
3. Atualiza `preco_atual` e registra no `historico_precos`
4. Limpeza automática: remove registros com mais de 90 dias

**Retorno:** `{ sucesso: boolean; mensagem?: string; erro?: string }`

---

## API Routes

### `GET /api/health`
Verifica saúde da aplicação e conexões.

**Resposta de Sucesso (200):**
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

**Resposta de Erro (500):**
```json
{
  "status": "error",
  "db": "disconnected",
  "message": "Erro interno no servidor"
}
```

---

## Padrões de Uso

### Validação
Todas as Server Actions usam `validateAction()` para verificar autenticação/autorização.

### Tratamento de Erro
Padrão de retorno:
```typescript
{ sucesso: boolean; erro?: string; ... }
```

### Revalidação de Cache
Após mutações, usa-se `revalidatePath()` para atualizar a UI.

### Tipagem
Todos os tipos estão definidos nos arquivos de actions ou em `src/types/db.ts`.
