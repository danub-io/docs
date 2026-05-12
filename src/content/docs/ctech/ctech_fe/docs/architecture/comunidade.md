---
title: "Módulo Comunidade"
---

## Visão Geral

O módulo **Comunidade** agrupa todas as funcionalidades de interação social do site:
- **Auth** — Login/registro, OAuth Google, 2FA, gerenciamento de sessão
- **Reviews de usuário** — Criação e exibição de avaliações de usuários nos produtos
- **Feed** — Página comunidade com avaliações recentes

## Feature Flag

Controlado pela env var `COMMUNITY_ENABLED`:

- `false` (padrão): módulo desabilitado — rotas retornam 404, middleware não carrega currentUser
- `true`: módulo habilitado — funcionalidades operam normalmente

A leitura é feita pela função `COMMUNITY_ENABLED()` em `src/modules/comunidade/feature.ts`.

## Estrutura

```
src/modules/comunidade/
├── auth/
│   ├── components/
│   │   ├── LoginDialog.tsx          # Modal de login/registro
│   │   ├── UserMenu.tsx             # Menu do usuário autenticado
│   │   └── PainelDashboard.tsx      # Dashboard do painel
│   ├── services/
│   │   ├── servicoAuth.ts           # Autenticação (JWT, OAuth, 2FA)
│   │   ├── servicoRateLimit.ts      # Rate limiting
│   │   └── servicoCriptografia.ts   # Criptografia TOTP
│   └── schemas/
│       ├── index.ts                 # Barrel de schemas
│       └── *.schema.ts              # Schemas Zod individuais
├── reviews/
│   ├── components/
│   │   ├── BotaoEscreverAnalise.tsx           # Botão "Escrever análise"
│   │   ├── ProdutoAvaliacoesUsuarios.astro    # Seção de reviews na página do produto
│   │   └── CartaoAvaliacaoColapsavel.tsx       # Card de review com expandir/recolher
│   └── services/
│       └── servicoReviews.ts        # CRUD de reviews de usuário
├── feed/
│   ├── components/
│   │   ├── FeedAvaliacoes.astro     # Feed de avaliações recentes
│   │   └── CabecalhoComunidade.astro # Cabeçalho da página comunidade
│   └── services/
│       └── servicoComunidade.ts     # Consultas do feed
├── index.ts                         # Barrel público
├── feature.ts                       # Função COMMUNITY_ENABLED()
└── __tests__/                       # Testes do módulo
```

## Como Ativar

```bash
# Desenvolvimento local
echo "COMMUNITY_ENABLED=true" >> .env
echo "COMMUNITY_ENABLED=true" >> .dev.vars

# Produção (Cloudflare Workers)
pnpm wrangler secret put COMMUNITY_ENABLED
# Digite: true
```

## Dependências

- **DB**: Usa a mesma conexão Turso (`@/core/lib/db`) que o resto do site
- **Middleware**: `src/middleware.ts` importa `COMMUNITY_ENABLED` para controlar rate limit, CSRF e currentUser
- **Componentes**: `BotaoEscreverAnalise` e `ProdutoAvaliacoesUsuarios` são renderizados condicionalmente em `[slug].astro`
- **Cache**: `servicoReviews.ts` tem cache próprio independente de `servicoProduto.ts`

## Estados de UI

| Componente | Desabilitado | Habilitado (sem login) | Habilitado (logado) |
|-----------|-------------|----------------------|---------------------|
| `LoginDialog` | Não renderizado | Botão "Entrar" visível | Escondido |
| `UserMenu` | Não renderizado | Escondido | Nome/avatar do usuário |
| `PainelDashboard` | Página redireciona para 404 | Redireciona para /?login=required | Dashboard funcional |
| `BotaoEscreverAnalise` | Não renderizado | Botão "Entrar" (abre LoginDialog) | Formulário de review |
| `ProdutoAvaliacoesUsuarios` | Não renderizado | Apenas cards (sem botão) | Cards + botão |
| `/comunidade` | Redireciona 404 | Feed de reviews | Feed + ações |
| `/api/auth/*` | Retorna 404 | Funcional | Funcional |
| `/api/reviews/*` | Retorna 404 | Retorna 401 (sem token) | Funcional |

## Transição

Os locais originais (`src/modules/auth/`, `src/core/ui/reviews/CartaoAvaliacaoColapsavel.tsx`, `src/modules/produto/components/BotaoEscreverAnalise.tsx`) mantêm re-exports para o módulo comunidade para não quebrar imports existentes. Podem ser removidos após confirmar que todos os imports foram atualizados.
