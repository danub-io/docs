---
title: "Schema do Banco de Dados — Turso (SQLite)"
---



Este documento descreve todas as tabelas, índices e relacionamentos do banco Turso compartilhado entre backend (ctech_be) e frontend (ctech_fe).

## Visão Geral

O banco é um SQLite serverless gerenciado pelo Turso. O backend escreve dados via Server Actions + Drizzle ORM, e o frontend lê diretamente em SSR via `@libsql/client`.

## Tabelas

### `Produtos`

Tabela central. Cada linha é um produto de hardware curado pelo ecossistema.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | INTEGER PK | Auto increment |
| `nome_produto` | TEXT NOT NULL | Nome do produto |
| `marca` | TEXT NOT NULL | Fabricante |
| `slug` | TEXT | Slug único para URL (ex: `sony-wh-1000xm5`) |
| `specs_json` | TEXT NOT NULL | Especificações técnicas em JSON |
| `tier` | TEXT NOT NULL | Nível: `Premium`, `Intermediario`, `CustoBeneficio` |
| `categoria` | TEXT | Categoria do produto (ex: `Notebook`, `Fone`) |
| `lancamento` | TEXT | Ano de lançamento |
| `nota_final` | REAL | Nota final compilada (0-10) |
| `imagem_url` | TEXT | URL da imagem do produto |
| `status` | TEXT DEFAULT `rascunho` | `rascunho` → `AprovadoM3` → `AprovadoM4` |
| `review_ia` | TEXT | Review gerada por IA |
| `pros_gerais` / `contras_gerais` | TEXT | Prós e contras consolidados |
| `congelar_precos` | INTEGER DEFAULT 0 | Se `1`, preços não são atualizados automaticamente |

**Índices:** `status`, `categoria`, `tier`, `slug`, `nota_final`, `LOWER(nome_produto)`

### `Reviews`

Avaliações de imprensa (`critic`) e de usuários (`user`) para cada produto.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | INTEGER PK | Auto increment |
| `produto_id` | INTEGER FK → Produtos.id | Produto relacionado |
| `review_type` | TEXT DEFAULT `critic` | `critic` (imprensa) ou `user` (usuário) |
| `site` | TEXT | Nome do site/fonte |
| `link` | TEXT | URL da review original |
| `snippet` | TEXT | Trecho da review |
| `nota_review` | REAL | Nota atribuída |
| `pros` / `contras` | TEXT | Prós e contras mencionados |
| `is_approved` | INTEGER DEFAULT 0 | Se `1`, aprovada para exibição |

**Índices:** `produto_id`, `(produto_id, review_type)`

### `Afiliados`

Links de afiliados (lojas/parceiros) para cada produto.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | INTEGER PK | Auto increment |
| `produto_id` | INTEGER FK → Produtos.id | Produto relacionado |
| `loja` | TEXT | Nome da loja (ex: `Amazon`, `Kabum`) |
| `url_afiliado` | TEXT | Link de afiliado |
| `preco_atual` | REAL | Preço atual |
| `ultima_atualizacao` | DATETIME | Timestamp da última atualização |
| `nota_preco` | REAL | Avaliação do preço |
| `status_erro` / `precisa_revisao` | BOOLEAN | Flags de erro/revisão |
| `is_afiliado` | INTEGER | Se `1`, é link de afiliado (não direto) |
| `snippet` | TEXT | Observação sobre a oferta |
| `link_original` | TEXT | URL original antes de limpeza |

**Índices:** `produto_id`, `loja`

### `Guias`

Guias de recomendação editoriais (modelo RTINGS). Agrupa produtos por tema.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | INTEGER PK | Auto increment |
| `slug` | TEXT UNIQUE NOT NULL | Slug para URL (`/guia/{slug}`) |
| `titulo` | TEXT NOT NULL | Título do guia |
| `descricao` | TEXT | Descrição curta (card) |
| `descricao_longa` | TEXT | Descrição editorial completa |
| `imagem_url` | TEXT | URL da imagem de capa |
| `categoria_pai` | TEXT NOT NULL | Categoria de produto relacionada |
| `grupo` | TEXT DEFAULT '' | Agrupamento temático (ex: `Por Uso`, `Por Preço`) |
| `ordem` | INTEGER DEFAULT 0 | Ordem de exibição |
| `ativo` | INTEGER DEFAULT 1 | Se `0`, oculto do frontend |

**Índices:** `slug` (único), `(categoria_pai, ativo)`

### `Guia_Produtos`

Relação many-to-many entre guias e produtos.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `guia_id` | INTEGER FK → Guias.id | Guia relacionado |
| `produto_id` | INTEGER FK → Produtos.id | Produto relacionado |
| `ordem` | INTEGER DEFAULT 0 | Ordem dentro do guia |

**PK:** `(guia_id, produto_id)`
**Índice:** `guia_id`

### `fila_processamento`

Fila de jobs assíncronos do backend (workers).

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | INTEGER PK | Auto increment |
| `modulo` | TEXT NOT NULL | `link-review`, `busca-texto`, `busca-precos` |
| `referencia_id` | INTEGER NOT NULL | ID do produto/review alvo |
| `status` | TEXT DEFAULT `pendente` | `pendente`, `processando`, `concluido`, `erro`, `falha_critica` |
| `tentativas` | INTEGER DEFAULT 0 | Número de tentativas (max 3 → DLQ) |
| `erro` | TEXT | Mensagem de erro da última tentativa |
| `prioridade` | INTEGER DEFAULT 0 | Prioridade do job |

**Índices:** `status`, `referencia_id`

### `historico_precos`

Histórico de preços dos afiliados ao longo do tempo.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | INTEGER PK | Auto increment |
| `produto_id` | INTEGER FK → Produtos.id | Produto relacionado |
| `loja` | TEXT | Nome da loja |
| `preco` | REAL | Preço capturado |
| `data_captura` | DATETIME | Timestamp da captura |

**Índice:** `(produto_id, data_captura)`

### `logs_entrada`

Logs detalhados do sistema (operações de IA, scraping, erros).

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | INTEGER PK | Auto increment |
| `timestamp` | DATETIME | Momento do log |
| `level` | TEXT | `info`, `warn`, `error` |
| `message` | TEXT | Mensagem do log |
| `details` | TEXT | Detalhes adicionais (JSON) |
| `tokens_prompt` / `tokens_completion` | INTEGER | Tokens usados (IA) |
| `model_id` | TEXT | Modelo de IA usado |
| `custo_est` | REAL | Custo estimado da operação |
| `module_name` | TEXT | Módulo que gerou o log |
| `input_payload` | TEXT | Payload de entrada |

**Índice:** `timestamp`

### `conflitos_entrada`

Conflitos de duplicidade detectados durante a ingestão (M1).

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | INTEGER PK | Auto increment |
| `nome_produto` | TEXT NOT NULL | Nome do produto conflitante |
| `marca` | TEXT | Marca |
| `dados_json` | TEXT NOT NULL | Dados completos da entrada |
| `motivo` | TEXT | Motivo do conflito |
| `match_candidato_id` | INTEGER | ID do produto candidato |
| `status` | TEXT DEFAULT `pendente` | `pendente`, `resolvido`, `descartado` |

**Índice:** `status`

### Tabelas de Configuração

#### `config_ai_models`

Modelos de IA configurados (provedores, chaves, preços).

| Coluna | Tipo |
|--------|------|
| `id` | INTEGER PK |
| `provider` | TEXT |
| `model_id` | TEXT |
| `api_key` | TEXT (criptografada AES-256-CBC) |
| `tier` | INTEGER DEFAULT 1 |
| `is_active` | INTEGER DEFAULT 1 |
| `system_prompt` | TEXT |
| `target_module` | TEXT |
| `input_price_1m` / `output_price_1m` | REAL |

#### `config_scraping_services`

Serviços de scraping configurados.

| Coluna | Tipo |
|--------|------|
| `id` | INTEGER PK |
| `name` | TEXT |
| `engine` | TEXT |
| `api_key` | TEXT |
| `tier` | INTEGER DEFAULT 1 |
| `is_active` | INTEGER DEFAULT 1 |

#### `config_preferences`

Preferências globais do painel (singleton, apenas 1 linha).

| Coluna | Tipo |
|--------|------|
| `id` | INTEGER PK (sempre 1) |
| `theme` | TEXT DEFAULT `dark` |
| `show_scanlines` | INTEGER DEFAULT 1 |
| `animations_enabled` | INTEGER DEFAULT 1 |
| `compact_mode` | INTEGER DEFAULT 0 |

#### `worker_control`

Controle de heartbeat dos workers.

| Coluna | Tipo |
|--------|------|
| `id` | TEXT PK |
| `is_active` | INTEGER DEFAULT 0 |
| `last_heartbeat` | DATETIME |

## Migrações

Gerenciadas via Drizzle Kit. Migrações em `drizzle/migrations/`:

| Migração | Descrição |
|----------|-----------|
| `0001_add_user_settings.sql` | Preferências do painel |
| `0002_add_review_type.sql` | Coluna `review_type` em Reviews |
| `0003_*` | Slug e índices em Produtos |
| `0004_quick_mariko_yashida.sql` | Tabelas Guias, Guia_Produtos, índices adicionais |

Aplicar migrações:
```bash
pnpm exec drizzle-kit push
```

## Relacionamentos (ER)

```
Produtos ──1:N──→ Reviews        (via produto_id)
Produtos ──1:N──→ Afiliados      (via produto_id)
Produtos ──1:N──→ historico_precos (via produto_id)
Produtos ──M:N──→ Guias           (via Guia_Produtos)
Guias ────1:N──→ Guia_Produtos   (via guia_id)
```
