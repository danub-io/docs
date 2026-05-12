---
title: "CTECH Frontend (TechReveal)"
---

**Site público que lê do banco para exibir produtos, categorias, preços.** E também escreve dados de usuários (cadastro, login, Google OAuth, 2FA, reviews de usuários).

---

Interface pública de alta performance para o ecossistema CTECH. Construída com **Astro 6** e **React 19**, focada em SEO, velocidade e experiência do usuário. Deploy em **Cloudflare Workers**.

## Tecnologias

- **Framework:** Astro 6+ (SSR) com Islands Architecture
- **Adapter:** `@astrojs/cloudflare` (Cloudflare Workers)
- **Biblioteca de UI:** React 19 (componentes interativos)
- **Estilização:** Tailwind CSS v4 + Design Tokens customizados
- **Componentes:** ShadCN v4 via `@base-ui/react` (MUI primitives)
- **Banco de Dados:** Turso (libsql) — SQLite distribuído
- **Validação:** Zod v4
- **Imagens:** `<img>` nativo (CDNs parceiras já entregam WebP otimizado)
- **Testes:** Vitest (unitários) + Playwright (E2E)
- **CI/CD:** GitHub Actions + Wrangler Deploy via tags semânticas

## Instalação e Execução

### Pré-requisitos

- `pnpm` instalado
- Node.js >= 22.12.0
- Conta no [Turso](https://turso.tech) (banco de dados)

### Variáveis de Ambiente

Copie `.env.example` para `.dev.vars` (exigido pelo runtime Cloudflare Workers):

```ini
TURSO_DATABASE_URL=libsql://seu-banco.turso.io
TURSO_AUTH_TOKEN=seu-token-aqui
AUTH_SECRET=seu-secret-jwt
```

### Comandos

```bash
pnpm install                    # Instalar dependências
pnpm dev                        # Servidor local (localhost:4321)
pnpm build                      # Build de produção
pnpm preview                    # Preview do build
pnpm test:run                   # Testes unitários (execução única)
pnpm test:coverage              # Testes com relatório de cobertura
pnpm test:e2e                   # Testes end-to-end (Playwright)
pnpm lint                       # Verifica ESLint
pnpm format                     # Formata código com Prettier
pnpm generate-types             # Gera types do worker Cloudflare
pnpm deploy                     # Deploy manual via wrangler deploy
pnpm release                    # Build + deploy (para uso com tags)
```

## Rotas

| Rota | Descrição |
|------|-----------|
| `/` | Home com produto em destaque e tendências |
| `/:categoria` | Página de listagem de produtos por categoria |
| `/:categoria/:slug` | Página detalhada do produto |
| `/:categoria/:slug/reviews` | Reviews da imprensa sobre o produto |
| `/:categoria/:slug/user-reviews` | Avaliações de usuários sobre o produto |
| `/guia` | Índice de guias de recomendação |
| `/guia/:slug` | Página individual de guia com produtos selecionados |
| `/painel` | Painel do usuário autenticado |

Rotas legadas (`/produto/:slug`, `/categoria/:categoria`) têm redirect 301 mantido para SEO.

## Arquitetura

O projeto segue metodologia **Modular (Vibecoding)**, otimizada para desenvolvimento assistido por IA:

```
src/
├── core/           # Infraestrutura global (UI, layouts, lib, services, styles, types)
│   └── ui/         # Componentes ShadCN (button, card, badge, etc.)
├── modules/        # Domínios isolados (inicio, produto, categoria, guia, auth, etc.)
│   ├── auth/       # Autenticação (serviços, componentes, schemas)
│   └── .../
│       ├── components/   # Componentes Astro/React do módulo
│       └── services/     # Serviços de acesso a dados
└── pages/          # Rotas Astro (camada fina, orquestra componentes)
    └── api/auth/   # Endpoints de autenticação (REST JSON)
```

## Fluxo de Dados

```
Turso DB (libsql) ← ctech_be (escrita)
    ↓ SSR queries (parametrizadas)
Services (try/catch → validação Zod)
    ↓
Páginas Astro (frontmatter SSR)
    ↓
Componentes Astro/React (props → render)
```

- **Server-Side Rendering:** Todo dado é buscado no frontmatter de páginas Astro
- **Nunca em cliente:** O banco não é acessado no navegador
- **Componentes com `server:defer`** podem buscar dados próprios

## Cache

Cache em memória (Map) com proteção contra stampede (`pendingFetch` compartilhado):

| Serviço | Métodos cacheados | TTL |
|---------|-------------------|-----|
| `servicoCatalogo` | `obterCategorias()` | 5 min |
| `servicoMenu` | `obterMenu()` | 5 min |
| `servicoProduto` | `obterTodosSlugs()` | 1h |
| `servicoGuia` | `obterCategoriasComGuias()` | 30 min |
| `servicoInicio` | `obterProdutoDestaque()`, `obterProdutosRecentes()` | 2 min |

Cache é invalidado apenas no restart do servidor (in-memory only).

## Deploy

O deploy em produção é controlado por **tags semânticas**, não por push direto na branch `production`:

```bash
git tag v1.0.0
git push origin v1.0.0
```

O CI detecta a tag, executa lint, testes, build e faz deploy automaticamente para Cloudflare Workers.

Para deploy manual de teste:
```bash
pnpm deploy
```

### Secrets do Worker

Antes do primeiro deploy, configure os secrets:
```bash
pnpm wrangler secret put TURSO_DATABASE_URL
pnpm wrangler secret put TURSO_AUTH_TOKEN
pnpm wrangler secret put AUTH_SECRET
pnpm wrangler secret put GOOGLE_CLIENT_ID
pnpm wrangler secret put GOOGLE_CLIENT_SECRET
```

## Segurança

- Content Security Policy (CSP) configurada via middleware
- HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy
- Rate limiting em rotas de autenticação (D1 database)
- Consultas parametrizadas ao banco (sem SQL injection)
- Cliente Turso usado apenas em SSR (nunca exposto ao cliente)
- Autenticação JWT com 2FA via otplib

## Estratégia de Imagens

Usamos `<img>` nativo em vez de `<Image />` de `astro:assets` por dois motivos:

1. O serviço `noop` não otimiza nada — `<Image />` com `noop` só gera URLs proxiadas que passam pelo Worker sem transformar a imagem
2. CDNs parceiras (Amazon, Kabum, etc.) já entregam WebP e dimensões adequadas

Se no futuro houver um binding `images` do Cloudflare, vale reavaliar.

## Licença

MIT — CTECH Frontend
