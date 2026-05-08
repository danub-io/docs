---
title: "CTECH Painel (Backend)"
---

**Ferramenta local que roda na sua máquina para popular o banco de dados.** Ingestão de produtos, preços, reviews, etc. Não precisa de login, não vai ser deployado, só você usa.

---

Este é o "Cérebro" do ecossistema CTECH. Um painel administrativo e motor de automação construído com **Next.js 16+** que gerencia o pipeline de dados desde a entrada bruta até a consolidação final via IA.

## Tecnologias

- **Framework:** Next.js 16 (App Router) com Turbopack
- **Linguagem:** TypeScript (Strict Mode)
- **Estilização:** Tailwind CSS v4 + Shadcn/ui (@base-ui/react)
- **Banco de Dados:** Turso (libsql) com Drizzle ORM
- **IA:** Vercel AI SDK (multi-provider: Google, Groq, Cerebras, OpenRouter, GitHub Models)
- **Logs:** Pino (Logging Estruturado)
- **Testes:** Vitest & Playwright
- **Scraping:** Puppeteer Extra + Stealth Plugin, Mozilla Readability, Cheerio

## Instalação e Execução

### Pré-requisitos
- `pnpm` instalado globalmente
- Arquivo `.env.local` configurado (veja `.env.example`)

### Comandos
```bash
pnpm install              # Instalar dependências
pnpm dev                  # Iniciar em modo desenvolvimento (porta 3001)
pnpm build                # Gerar build de produção
pnpm start                # Iniciar servidor de produção
pnpm test:run             # Rodar testes unitários
pnpm test:e2e             # Rodar testes E2E (Playwright)
pnpm lint                 # Verificar lint
pnpm db:generate          # Gerar migrações Drizzle
pnpm db:migrate           # Aplicar migrações
pnpm db:studio            # Abrir Drizzle Studio
```

## Arquitetura: 9 Módulos (M1-M9)

O projeto é dividido em 9 módulos independentes, cada um isolado para facilitar edição via vibecoding:

### M1 — Entrada
Ingestão e detecção de duplicidade semântica. A IA extrai do texto bruto um JSON com `marca`, `nome_produto`, `specs_cru`, `tier I-V`. Candidatos similares são enviados para veredito semântico da IA.

### M2 — Descoberta
Busca de links de reviews técnicas em massa via template de busca. IA tria links descartando fóruns, vídeos e lojas.

### M3 — Extração
Leitura de artigos, pontuação (0-10), extração de `pros`, `contras`, `mini_review` e specs faltantes. Review_type distingue critic de user.

### M4 — Consolidação
Atua como Editor-Chefe: agrega até 8 reviews, calcula Nota Bayesiana (média global 7.5, mín. 3 reviews) com Fator de Defasagem (0.2/ano). Sintetiza Veredito Final.

### M5 — Preços
Monitoramento contínuo de preços via Google Shopping. Detecção de falsos positivos (capinha, cabo, modelo errado). Variações > R$5,00 guardadas em `historico_precos` (retenção 90 dias).

### M6 — Conferência
Auditoria do link final (Afiliado): scraper navega na URL salva para capturar preço PIX/Boleto e estoque.

### M7 — CMS
Gerenciador central do catálogo de produtos (CRUD) com listagem, filtros (marca, categoria, lançamento), edição e exclusão.

### M8 — Configurações
Painel modular de configurações globais: modelos IA (cascata 6-tiers), serviços de scraping, logs do sistema, manutenção do banco, preferências.

### M9 — Documentação
Visualizador de documentação Markdown integrado ao painel com sidebar, busca (Ctrl+K) e renderização GFM.

## Sistema de Filas

- Tabela `fila_processamento` gerencia jobs em background (status: pendente, processando, concluido, erro, falha_critica)
- **DLQ (Dead Letter Queue):** Após 3 tentativas falhas, job marcado como `falha_critica`
- Worker faz claim atômico com batch processing (BATCH_SIZE=10)

## Cache Inteligente

Cache em memória (Map) com TTL configurável via `CacheLayer`:

| Query | TTL |
|-------|-----|
| `getAIModels`, `getScrapingServices`, `getDefaultPrompt` | 10 min |
| `getProdutosParaConsolidar`, `getProdutosParaBuscaReview` | 5 min |

Invalidação automática nas mutações. Cache bypass via parâmetro `refresh = true`.

## Estratégia de Performance

- **SSR Prioritário:** Módulos de consulta pesada usam SSR
- **I/O Paralelo:** `Promise.all()` obrigatório em páginas com múltiplas fontes
- **Suspense + Skeletons:** `ModuleSkeleton` para feedback visual imediato
- **Prefetching:** Todos os links do ActivityBar com `prefetch={true}`
- **Resizable Panels:** `react-resizable-panels` v4 com `autoSaveId` para persistência

## Banco de Dados (Turso SQLite)

Principais tabelas: `Produtos`, `Reviews` (com `review_type`), `Afiliados`, `historico_precos`, `fila_processamento`, `config_ai_models`, `config_scraping_services`, `logs_entrada`, `config_preferences`, `Guias`, `Guia_Produtos`.

Colunas obsoletas removidas em Abr/2026 (`embedding`, `is_primary`, `is_fallback`, `is_reserve`, `Afiliados.imagem_url`).

## Segurança

- API Keys criptografadas em AES-256-CBC nas tabelas de configuração
- SQL parametrizado (sem injeção)
- Tokens JWT com jose
- Rate limiting em rotas de autenticação

## Migrações

Gerenciadas via Drizzle Kit:
```bash
pnpm db:generate    # Gerar migração
pnpm db:migrate     # Aplicar migração
```

Para migrations SQL manuais (ex: rate_limit), execute via Turso CLI:
```bash
turso db shell <database> < migrations/arquivo.sql
```

## Licença

MIT — CTECH Backend
