---
title: "Arquitetura — CTECH Backend"
---

## Visão Geral

Ecossistema de curadoria técnica de hardware e inteligência comercial. Pipeline automatizado que transforma texto bruto em fichas de produto publicáveis com reviews consolidadas, preços monitorados e links afiliados auditados.

```
Texto bruto → M1 (Entrada) → M2 (Descoberta) → M3 (Extração) → M4 (Consolidação) → Produto final
                                                                   M5 (Preços) → M6 (Conferência) → Afiliado
```

## Estrutura de Diretórios

```
src/
├── app/
│   ├── 1-entrada/        # M1: UI de entrada
│   ├── 2-descoberta/     # M2: UI de descoberta
│   ├── 3-extracao/       # M3: UI de extração
│   ├── 4-consolidacao/   # M4: UI de consolidação
│   ├── 5-precos/         # M5: UI de preços
│   ├── 6-conferencia/    # M6: UI de conferência
│   ├── 7-cms/            # M7: CMS do catálogo
│   ├── 8-configuracoes/  # M8: Configurações globais
│   ├── 9-docs/           # M9: Visualizador de documentação
│   ├── actions/          # Server Actions (regras de negócio)
│   │   ├── 1-entrada/    # Actions do M1
│   │   ├── 2-descoberta/ # Actions do M2
│   │   ├── 3-extracao/   # Actions do M3
│   │   ├── 4-consolidacao/ # Actions do M4
│   │   ├── 5-precos/     # Actions do M5
│   │   ├── 6-conferencia/ # Actions do M6
│   │   ├── 7-cms/        # Actions do M7
│   │   ├── 8-configuracoes/ # Actions do M8 (ai-models, scraping-services, logs, preferences)
│   │   └── worker.ts     # Worker de fila
│   └── api/              # API routes (se houver)
├── components/           # UI global (ActivityBar, Sidebar, CommandPalette, Logs)
├── lib/                  # Helpers de BD, scraping, queues, cache, criptografia
│   ├── repositories/     # Repository pattern (ex: cms-repository.ts)
│   ├── cache.ts          # CacheLayer (Map-based com TTL)
│   └── logger.ts         # Pino logger estruturado
├── hooks/                # React hooks
├── db/                   # Configuração Drizzle + schema
└── types/                # Tipos TypeScript
```

## Sistema de Filas e Resiliência

### Fluxo de Processamento

1. Job inserido na `fila_processamento` com status `pendente`
2. Worker faz claim atômico (status → `processando`)
3. Se sucesso: status → `concluido`
4. Se falha: incrementa `tentativas`
5. Se `tentativas >= 3`: status → `falha_critica` (DLQ)

### Monitoramento

Logging estruturado via Pino em todos os módulos críticos (M1-M6). Health check do worker via tabela de logs.

## Provedores de IA

Múltiplos provedores via Vercel AI SDK:

| Provider | Pacote | Uso |
|----------|--------|-----|
| Groq | `@ai-sdk/groq` | Extração rápida |
| Cerebras | `@ai-sdk/cerebras` | Processamento em lote |
| OpenRouter | `@openrouter/ai-sdk-provider` | Fallback |
| GitHub Models | `@github/models` | Modelos variados |

Cascata de resiliência (6 tiers) configurável via tabela `config_ai_models`.

## Cache

Cache em memória (Map) via `CacheLayer`:

| Query | TTL | Invalidação |
|-------|-----|-------------|
| `getAIModels` | 10 min | upsert/delete/toggle AI model |
| `getScrapingServices` | 10 min | upsert/delete/toggle scraping service |
| `getDefaultPrompt` | 10 min | (manual) |
| `getProdutosParaConsolidar` | 5 min | Aprovação M3/M4 |
| `getProdutosParaBuscaReview` | 5 min | Aprovação M3/M4 |

Cache bypass: `{ refresh: true }` força recarga.

## Schema do Banco

Principais tabelas e relacionamentos:

- **Produtos:** Catálogo central (specs, nota final, imagem). Fonte única de verdade para imagens.
- **Reviews:** Análises unitárias (M3) e avaliações de usuários. `review_type` (`critic` | `user`).
- **Afiliados:** Links finais de loja/oferta validados no M6. (Coluna `imagem_url` removida.)
- **historico_precos:** Oscilação de preço (retenção 90 dias).
- **fila_processamento:** Jobs em background (status, tentativas, modulo, referencia_id).
- **config_ai_models:** Modelos IA com API keys criptografadas (AES-256-CBC).
- **config_scraping_services:** Serviços de scraping configuráveis.
- **logs_entrada:** Auditoria de consumo (tokens, custo, payload).
- **Guias / Guia_Produtos:** Guias de recomendação editoriais.

## Scraping

- **Puppeteer Extra + Stealth Plugin:** Navegação em sites de e-commerce
- **Mozilla Readability:** Extração de texto de artigos
- **Cheerio:** Parsing HTML leve
- **Turndown:** HTML → Markdown

## Layout e UI

- **ActivityBar:** Navegação principal entre módulos (ícones + tooltips)
- **Sidebar:** Contextual por módulo
- **CommandPalette:** Busca global (Ctrl+K)
- **GlobalResizableLayout:** Layout multi-coluna com painéis redimensionáveis
- **Tema:** next-themes (claro/escuro)

## Ambiente de Desenvolvimento

- **Turbo Mode:** `next dev --turbo` para hot reload rápido
- **Banco Local:** Turso local ou remoto via libsql
- **GitHub CLI:** `gh` para gerenciamento de PRs
- **SSH:** Conexão GitHub via chaves ED25519

## Estratégia de Branches

- `production`: Branch principal
- `develop`: Integração
- `feature/*`, `fix/*`, `refactor/*`, `chore/*`
