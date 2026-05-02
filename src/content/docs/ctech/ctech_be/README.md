---
title: "CTECH Painel (Backend)"
---



Este é o "Cérebro" do ecossistema CTECH. Um painel administrativo e motor de automação construído com **Next.js 16+** que gerencia o pipeline de dados desde a entrada bruta até a consolidação final via IA.

## 🚀 Tecnologias

- **Framework:** Next.js (App Router)
- **Linguagem:** TypeScript (Strict Mode)
- **Estilização:** Tailwind CSS v4 + Shadcn/ui
- **Banco de Dados:** Turso (libsql)
- **IA:** Vercel AI SDK
- **Logs:** Pino (Logging Estruturado)
- **Testes:** Vitest & Playwright

## 🛠️ Instalação e Execução

### Pré-requisitos
- `pnpm` instalado globalmente.
- Arquivo `.env.local` configurado (veja `.env.example`).

### Comandos
```bash
# Instalar dependências
pnpm install

# Iniciar em modo desenvolvimento
pnpm dev

# Gerar build de produção
pnpm build

# Rodar testes unitários
pnpm test
```

## 🏗️ Arquitetura e Regras de Negócio

Este projeto é dividido em 9 módulos independentes (M1-M9), onde cada módulo é isolado para facilitar edição e manutenção via vibecoding (foco de IAs):
1. **M1 (Entrada):** Ingestão e detecção de duplicidade.
2. **M2 (Descoberta):** Busca de links de reviews.
3. **M3 (Extração):** Processamento de texto de reviews via IA.
4. **M4 (Consolidação):** Unificação de reviews e cálculo de nota.
5. **M5 (Comercial):** Monitoramento de preços e ofertas.
6. **M6 (Conferência):** Auditoria final de estoque e links.
7. **M7 (CMS):** Gerenciador central do catálogo de produtos (CRUD).
8. **M8 (Configurações):** Painel modular de configurações globais (IA, Scrapers, Logs).
9. **M9 (Documentação):** Visualizador de documentação Markdown integrado ao painel.

**Estratégia de Modularização:** Cada módulo (M1-M9) é projetado para ser autônomo, permitindo que IAs editem pontos estratégicos com foco e contexto reduzido.

> Para uma explicação profunda da lógica de negócio e estrutura técnica, leia o [**ARCHITECTURE.md**](./ARCHITECTURE.md).

## 🛡️ Instruções para Desenvolvimento

- **UTF-8 SEM BOM:** Obrigatório para todos os arquivos.
- **Server Components:** Priorizar SSR para carregamento de dados.
- **Repository Pattern:** Consultas ao banco devem ficar em `src/lib/repositories/`.
- **Logger:** Use `@/lib/logger` em vez de `console.log`.

---
*CTECH Backend v2026.4*
