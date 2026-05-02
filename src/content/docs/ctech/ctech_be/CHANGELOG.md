---
title: "Changelog"
---



Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-br/1.1.0/),
e este projeto segue o [Semantic Versioning](https://semver.org/lang/pt-BR/).

## [Unreleased]

### Adicionado
- **Coluna `review_type` na tabela `Reviews`:** Adicionado campo `review_type` (`'critic' | 'user'`) via ALTER TABLE para suportar avaliações de usuários no frontend.
- **M9: Documentação** - Novo módulo em `/docs` que centraliza toda a documentação do projeto
  - Sidebar com navegação entre todos os documentos
  - Busca integrada via Command Palette (Ctrl+K)
  - Renderização de markdown com suporte a GFM
  - Rotas dinâmicas para todos os documentos do projeto
- Integração do M9 na ActivityBar (navegação principal)
- Dependências `react-markdown` e `remark-gfm` para renderização
- Documentação completa da API (`API.md`)
- Guia de contribuição (`CONTRIBUTING.md`)
- **DLQ (Dead Letter Queue):** Sistema de resiliência para jobs falhos após 3 tentativas (commit `32c06d3`)
- **Logging Estruturado:** Implementação de Pino via `@/lib/logger` para auditoria de módulos críticos (commit `32c06d3`)
- **M3:** Extração de especificações faltantes em reviews com IA (commit `82e3ff5`)

### Corrigido
- **Security:** Correção de SQL Injection em cláusulas IN via placeholders parametrizados (commit `08881d7`)
- **M4:** Eliminado gargalo N+1 com batch processing em `processarConsolidacao` (commit `57b4d31`)
- **M3:** Resolução de tipos TypeScript em `specs_extraidas` (commit `c18c7d9`)
- **Worker:** Correção de testes falhos e expansão de cobertura para DLQ (commits `3539464`, `7b11a7a`)
- **M1:** Atualização de system prompt para múltiplos aparelhos no módulo de entrada (commit `5f5a3dd`)

### Atualizado (2026-05-01)
- **API.md:** Adicionadas seções M8 (Configurações), M9 (Documentação), Worker & Queue e Utilitários
  - 18 funções Server Actions do M8 documentadas (`ai-models.ts`, `scraping-services.ts`, `logs.ts`, `preferences.ts`)
  - Funções de Worker (`processNextJob`, `runWorkerBatch`)
  - Utilitários (`getSetting`, `setSetting`, `atualizarPrecosComIA`)
- **ARCHITECTURE.md:** Adicionado M9 (Documentação) na seção de módulos
- **docs/architecture/:** Populado com `diagrams.md`, `queue-system.md`, `repository-pattern.md`, `ai-integration.md`
- **docs/deployment/:** Populado com `vercel.md`, `docker.md`, `environment.md`
- **docs/troubleshooting/:** Populado com `database.md`, `scraping.md`, `ai-services.md`, `common-errors.md`

### Melhorado
- Estrutura de documentação do projeto
- Renomeação de módulos para nomenclatura consistente (ex: `2-busca-link-review` → `2-descoberta`, `5-busca-precos` → `5-precos`)

---

## [0.1.0] - 2026-04-15

### Adicionado
- M1: Módulo de Entrada (Ingestão de produtos com IA)
- M2: Módulo de Descoberta (Busca de reviews via web scraping)
- M3: Módulo de Extração (Análise técnica de reviews com IA)
- M4: Módulo de Consolidação (Veredito final com IA e nota bayesiana)
- M5: Módulo de Preços (Monitoramento de preços em lojas)
- M6: Módulo de Conferência (Auditoria de links e preços)
- M7: Módulo CMS (Gerenciador de catálogo)
- M8: Módulo de Configurações (Gerenciamento de modelos IA e scraping)
- Repository Pattern para acesso a dados
- Integração com múltiplos provedores de IA (Google, Groq, Cerebras, OpenRouter, GitHub Models)
- Sistema de fila para processamento assíncrono
- Testes unitários com Vitest (cobertura 60%)
- Testes E2E com Playwright
- CI/CD com GitHub Actions
- Logging estruturado com Pino
- Suporte a Turso (libsql) com Drizzle ORM
- Documentação inicial (README.md, ARCHITECTURE.md)

### Configuração
- Next.js 16.2.3 com App Router
- TypeScript em modo strict
- Tailwind CSS v4 + Shadcn/ui
- ESLint configurado
- EditorConfig (UTF-8 SEM BOM, 2 espaços)
