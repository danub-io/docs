---
title: "Schema do Banco de Dados (Consolidado)"
description: "Tabelas, indices e relacionamentos do banco Turso compartilhado entre ctech_be e ctech_fe"
---

O ecossistema CTECH utiliza um banco **Turso (SQLite distribuido)** unico, compartilhado entre backend (escrita) e frontend (leitura SSR).

> Documentacao original: [ctech_be/docs/architecture/schema-banco.md](../ctech_be/docs/architecture/schema-banco.md)

---

## Tabela: Produtos

Tabela central do catalogo.

| Coluna | Tipo | Descricao |
|--------|------|-----------|
| `id` | INTEGER PK | Auto increment |
| `nome_produto` | TEXT NOT NULL | Nome do produto |
| `marca` | TEXT NOT NULL | Fabricante |
| `slug` | TEXT | Slug unico para URL (ex: `sony-wh-1000xm5`) |
| `specs_json` | TEXT NOT NULL | Especificacoes tecnicas em JSON |
| `tier` | TEXT NOT NULL | Nivel: `Premium`, `Intermediario`, `CustoBeneficio` |
| `categoria` | TEXT | Categoria (ex: `Notebook`, `Fone`) |
| `lancamento` | TEXT | Ano de lancamento |
| `nota_final` | REAL | Nota final compilada (0-10) |
| `imagem_url` | TEXT | URL da imagem do produto |
| `status` | TEXT DEFAULT `rascunho` | `rascunho` -> `AprovadoM3` -> `AprovadoM4` |
| `review_ia` | TEXT | Review gerada por IA |
| `pros_gerais` / `contras_gerais` | TEXT | Pros e contras consolidados |
| `congelar_precos` | INTEGER DEFAULT 0 | Se `1`, precos nao sao atualizados automaticamente |

**Indices:** `status`, `categoria`, `tier`, `slug`, `nota_final`, `LOWER(nome_produto)`

**Importante para o frontend:** Apenas produtos com `status = 'AprovadoM4'` sao exibidos publicamente.

---

## Tabela: Reviews

Avaliacoes de imprensa (`critic`) e de usuarios (`user`).

| Coluna | Tipo | Descricao |
|--------|------|-----------|
| `id` | INTEGER PK | Auto increment |
| `produto_id` | INTEGER FK -> Produtos.id | Produto relacionado |
| `review_type` | TEXT DEFAULT `critic` | `critic` (imprensa) ou `user` (usuario) |
| `site` | TEXT | Nome do site/fonte |
| `link` | TEXT | URL da review original |
| `snippet` | TEXT | Trecho da review |
| `nota_review` | REAL | Nota atribuida |
| `pros` / `contras` | TEXT | Pros e contras mencionados |
| `is_approved` | INTEGER DEFAULT 0 | Se `1`, aprovada para exibicao |

**Indices:** `produto_id`, `(produto_id, review_type)`

---

## Tabela: Afiliados

Links de afiliados (lojas/parceiros) para cada produto.

| Coluna | Tipo | Descricao |
|--------|------|-----------|
| `id` | INTEGER PK | Auto increment |
| `produto_id` | INTEGER FK -> Produtos.id | Produto relacionado |
| `loja` | TEXT | Nome da loja (ex: `Amazon`, `Kabum`) |
| `url_afiliado` | TEXT | Link de afiliado |
| `preco_atual` | REAL | Preco atual |
| `ultima_atualizacao` | DATETIME | Timestamp da ultima atualizacao |
| `nota_preco` | REAL | Avaliacao do preco |
| `status_erro` / `precisa_revisao` | BOOLEAN | Flags de erro/revisao |
| `is_afiliado` | INTEGER | Se `1`, e link de afiliado (nao direto) |
| `snippet` | TEXT | Observacao sobre a oferta |
| `link_original` | TEXT | URL original antes de limpeza |

**Indices:** `produto_id`, `loja`

---

## Tabela: Guias

Guias de recomendacao editoriais (modelo RTINGS).

| Coluna | Tipo | Descricao |
|--------|------|-----------|
| `id` | INTEGER PK | Auto increment |
| `slug` | TEXT UNIQUE NOT NULL | Slug para URL (`/guia/{slug}`) |
| `titulo` | TEXT NOT NULL | Titulo do guia |
| `descricao` | TEXT | Descricao curta (card) |
| `descricao_longa` | TEXT | Descricao editorial completa |
| `imagem_url` | TEXT | URL da imagem de capa |
| `categoria_pai` | TEXT NOT NULL | Categoria de produto relacionada |
| `grupo` | TEXT DEFAULT '' | Agrupamento tematico (ex: `Por Uso`, `Por Preco`) |
| `ordem` | INTEGER DEFAULT 0 | Ordem de exibicao |
| `ativo` | INTEGER DEFAULT 1 | Se `0`, oculto do frontend |

**Indices:** `slug` (unico), `(categoria_pai, ativo)`

---

## Tabela: Guia_Produtos

Relacao many-to-many entre guias e produtos.

| Coluna | Tipo | Descricao |
|--------|------|-----------|
| `guia_id` | INTEGER FK -> Guias.id | Guia relacionado |
| `produto_id` | INTEGER FK -> Produtos.id | Produto relacionado |
| `ordem` | INTEGER DEFAULT 0 | Ordem dentro do guia |

**PK:** `(guia_id, produto_id)`
**Indice:** `guia_id`

---

## Tabela: fila_processamento

Jobs assincronos do backend.

| Coluna | Tipo | Descricao |
|--------|------|-----------|
| `id` | INTEGER PK | Auto increment |
| `modulo` | TEXT NOT NULL | `link-review`, `busca-texto`, `busca-precos` |
| `referencia_id` | INTEGER NOT NULL | ID do produto/review alvo |
| `status` | TEXT DEFAULT `pendente` | `pendente`, `processando`, `concluido`, `erro`, `falha_critica` |
| `tentativas` | INTEGER DEFAULT 0 | Numero de tentativas (max 3 -> DLQ) |
| `erro` | TEXT | Mensagem de erro da ultima tentativa |
| `prioridade` | INTEGER DEFAULT 0 | Prioridade do job |

**Indices:** `status`, `referencia_id`

---

## Tabela: historico_precos

Historico de precos dos afiliados ao longo do tempo.

| Coluna | Tipo | Descricao |
|--------|------|-----------|
| `id` | INTEGER PK | Auto increment |
| `produto_id` | INTEGER FK -> Produtos.id | Produto relacionado |
| `loja` | TEXT | Nome da loja |
| `preco` | REAL | Preco capturado |
| `data_captura` | DATETIME | Timestamp da captura |

**Indice:** `(produto_id, data_captura)`

---

## Tabelas de Configuracao (backend)

### config_ai_models

Modelos de IA com chaves criptografadas (AES-256-CBC). Colunas: `id`, `provider`, `model_id`, `api_key`, `tier`, `is_active`, `system_prompt`, `target_module`, `input_price_1m`, `output_price_1m`.

### config_scraping_services

Servicos de scraping. Colunas: `id`, `name`, `engine`, `api_key`, `tier`, `is_active`.

### config_preferences

Preferencias do painel (singleton). Colunas: `theme`, `show_scanlines`, `animations_enabled`, `compact_mode`.

### worker_control

Heartbeat dos workers. Colunas: `id`, `is_active`, `last_heartbeat`.

---

## Tabela: logs_entrada

Auditoria do sistema. Colunas: `id`, `timestamp`, `level`, `message`, `details`, `tokens_prompt`, `tokens_completion`, `model_id`, `custo_est`, `module_name`, `input_payload`.

---

## Tabela: conflitos_entrada

Conflitos de duplicidade detectados na ingestao. Colunas: `id`, `nome_produto`, `marca`, `dados_json`, `motivo`, `match_candidato_id`, `status`.

---

## Relacionamentos (ER)

```
Produtos --1:N--> Reviews        (via produto_id)
Produtos --1:N--> Afiliados      (via produto_id)
Produtos --1:N--> historico_precos (via produto_id)
Produtos --M:N--> Guias          (via Guia_Produtos)
Guias   --1:N--> Guia_Produtos  (via guia_id)
```
