---
title: "Arquitetura — CTECH Frontend"
---

Este documento detalha as decisões arquiteturais, fluxo de dados e padrões de desenvolvimento do frontend.

## Design Modular e Vibecoding

O projeto foi estruturado para manter baixo custo cognitivo para desenvolvimento assistido por IA, com isolamento claro entre módulos.

### Estrutura de Diretórios

```
src/
├── core/                        # Infraestrutura e base do sistema
│   ├── ui/                      # Componentes ShadCN (button, card, badge, etc.)
│   │   └── reviews/             # CartaoImprensa, CartaoAvaliacaoColapsavel
│   ├── layouts/                 # Layout, Navbar, Footer
│   ├── lib/                     # Conexão DB, cache, logger, utilitários (cn, corNota)
│   ├── services/                # Serviços globais com cache (servicoCatalogo, servicoMenu)
│   ├── styles/                  # CSS Global e design tokens (Tailwind v4)
│   └── types/                   # Schemas Zod e tipos TypeScript (product, avaliacao, guia)
│
├── modules/                     # Domínios isolados por funcionalidade
│   ├── inicio/                  # Página inicial (Hero, Categorias, Tendencias)
│   ├── produto/                 # Páginas de detalhes do produto
│   ├── categoria/               # Páginas de categoria com agrupamento por labels
│   ├── guia/                    # Guias de recomendação editoriais
│   ├── comparar/                # Motor de comparação de produtos
│   ├── comunidade/              # Feed da comunidade
│   ├── auth/                    # Autenticação (serviços, componentes, schemas)
│   └── rolagem_horizontal/      # Componentes de carrossel horizontal
│
├── pages/                       # Camada de roteamento (Astro)
│   ├── index.astro              # Home
│   ├── [categoria]/[slug]       # Produto individual
│   ├── [categoria]/             # Listagem por categoria
│   ├── guia/[slug].astro        # Guia individual
│   ├── painel/                  # Painel do usuário
│   └── api/auth/                # Endpoints de autenticação
```

### Metodologia "Vibecoding"

1. **Isolamento de Escopo:** Forneça apenas o contexto do módulo relevante para a IA
2. **Modificações Locais:** Evite alterar `@core/*` a menos que estritamente necessário
3. **Contratos Claros:** Componentes em `@modules` recebem dados via props tratadas nas páginas

## Fluxo de Dados

```
Turso DB (libsql) ← ctech_be (escrita)
    ↑↓ SSR queries (parametrizadas com placeholders ?)
    ↓
Services (try/catch → safeParse Zod)
    ↓
Páginas Astro (chamadas SSR no frontmatter)
    ↓
Componentes Astro/React (props → render)
```

- **Server-Side Rendering:** Todo dado é buscado no frontmatter de páginas Astro
- **Nunca em cliente:** O banco não é acessado no navegador
- **Componentes com `server:defer`** podem buscar dados próprios (ex: Tendencias, ProdutoOndeComprar)
- **Tratamento de erros:** Serviços retornam `[]` ou `null` em caso de falha
- **Função agregada:** `servicoProduto.obterProdutoCompleto()` paraleliza 3 queries (produto + reviews críticas + afiliados)

## Cache em Memória

Cache com proteção contra stampede (Map-based TTL + `pendingFetch` compartilhado):

| Serviço | Método | TTL |
|---------|--------|-----|
| `servicoCatalogo` | `obterCategorias()` | 5 min |
| `servicoMenu` | `obterMenu()` | 5 min |
| `servicoProduto` | `obterTodosSlugs()` | 1h |
| `servicoGuia` | `obterCategoriasComGuias()` | 30 min |
| `servicoInicio` | `obterProdutoDestaque()`, `obterProdutosRecentes()` | 2 min |

Cache é invalidado apenas no restart do servidor.

## Serviços

Cada domínio possui um serviço que encapsula consultas SQL e transformações.

### Core Services

| Serviço | Arquivo | Funções |
|---------|---------|---------|
| `servicoCatalogo` | `src/core/services/servicoCatalogo.ts` | `obterCategorias()` |
| `servicoMenu` | `src/core/services/servicoMenu.ts` | `obterMenu()` |

### Module Services

| Módulo | Serviço | Funções |
|--------|---------|---------|
| Início | `servicoInicio` | `obterProdutoDestaque()`, `obterProdutosRecentes()` |
| Produto | `servicoProduto` | `obterProdutoPorSlug()`, `obterTodosSlugs()`, `obterAvaliacoesCriticas()`, `obterAvaliacoesUsuarios()`, `obterAfiliados()`, `obterProdutoCompleto()` |
| Categoria | `servicoCategoria` + `servicoSecoesCategoria` | `obterProdutosPorCategoria()`, `obterSecoes()` |
| Guia | `servicoGuia` | `obterGuiasPorCategoria()`, `obterGuiaPorSlug()`, `obterProdutosDoGuia()` |
| Busca | `servicoBusca` | `buscar()` |
| Comparar | `servicoComparacao` | `obterProdutosComparacao()`, `obterTopProdutos()`, `obterSugestoesBusca()` |
| Comunidade | `servicoComunidade` | `obterAvaliacoesRecentes()` |
| Auth | `servicoAuth` | `verificarToken()`, `buscarUsuarioPorId()`, `usuarioParaPublico()` |

## Islands Architecture

O projeto usa Astro Islands — componentes React interativos ilhados em HTML estático:

| Tipo | Uso | Hidratação |
|------|-----|-----------|
| **Astro nativo** | Layouts, páginas, listas | Zero JS no cliente |
| **React Island** | NotaBadge, CartaoAvaliacaoColapsavel | `client:visible` ou `client:idle` |
| **React Interativo** | LoginDialog, UserMenu, SearchCommand | `client:load` / `client:idle` |

### Critério de Escolha

- Prefira **Astro** puro para componentes de apresentação
- Use **React** apenas quando precisar de estado, eventos ou hooks
- Priorize `client:visible` sobre `client:load` para performance

## Tipos e Validação (Zod v4)

| Schema | Arquivo | Uso |
|--------|---------|-----|
| `ProductSchema` | `src/core/types/product.ts` | Validação de produtos |
| `AvaliacaoSchema` | `src/core/types/avaliacao.ts` | Reviews de imprensa e usuários |
| `GuiaSchema` | `src/core/types/guia.ts` | Guias de recomendação |
| `LabelSchema` | `src/core/types/label.ts` | Labels de categoria |

## Estratégia de CSS (Tailwind v4)

- **Mobile First:** Classes base = mobile. `md:`, `lg:` para breakpoints
- **Design Tokens:** Cores e tipografia definidas em `src/core/styles/global.css`
- **Componentes:** Prefira compor classes Tailwind em vez de CSS avulso
- **cn() utility:** Use `cn()` para merge condicional de classes

### Layout Tokens

| Token | Valor | Uso |
|-------|-------|-----|
| `--spacing-container-max` | 1280px | Largura máxima do container |
| `--spacing-gutter` | 24px | Gap entre itens em grids |
| `--spacing-section-gap` | 32px | Espaçamento entre seções |
| `--spacing-box-padding` | 24px | Padding interno de cards |

### Typography Tokens

| Token | Valor | Uso |
|-------|-------|-----|
| `--font-heading` | 'Inter Variable' | Títulos (display, page-title, section-title) |
| `--font-body` | 'Inter Variable' | Corpo de texto |
| `--font-display` | 'Inter Variable' | Seções em uppercase (section-title) |
| `--font-sans` | 'Inter Variable' | UI geral (nav, meta, labels) |

### Typography Utilities

14 classes utilitárias `type-*` em `src/core/styles/global.css`, inspiradas no sistema tipográfico da RTINGS.com:

| Classe | Uso | Font | Size | Weight |
|--------|-----|------|------|--------|
| `type-display` | Título hero da home | heading | 4xl/5xl | medium |
| `type-page-title` | Título de página | heading | 2xl/4xl | medium |
| `type-section-title` | Título de seção (uppercase) | display | xl | normal |
| `type-subsection` | Subtítulo de seção | heading | xl | medium |
| `type-card-title` | Título de card | heading | base | semibold |
| `type-body` | Corpo de texto | (herdado) | base | normal |
| `type-body-sm` | Corpo pequeno | (herdado) | sm | normal |
| `type-body-lg` | Corpo grande | (herdado) | lg | normal |
| `type-meta` | Metadados UI | sans | xs | medium |
| `type-caption` | Legendas | sans | xs | normal |
| `type-overline` | Overline label | sans | 10px | bold |
| `type-micro` | Micro label | sans | 10px | bold |
| `type-card-meta` | Metadados de card | sans | 11px | normal |
| `type-nav-link` | Links de navegação | sans | sm | normal |
| `type-view-all` | Link "Ver todos" | sans | xs | medium |

> Componentes ShadCN UI agora declaram `font-sans` explicitamente em vez de herdar do `html`.

## Autenticação

Módulo em `src/modules/auth/`:

- `services/servicoAuth.ts` — Registro, login, verificação 2FA (JWT com jose, bcryptjs, otplib)
- `services/servicoRateLimit.ts` — Rate limiting (memória em dev, D1 em prod)
- `services/servicoCriptografia.ts` — Hash de senha, JWT, 2FA

### Middleware de Segurança

O middleware (`src/middleware.ts`) aplica:

- Verificação de token JWT em todas as rotas (não-assets)
- Rate limiting em rotas `/api/auth/*` (5 req/min login, 3 req/min 2FA, 10 req/h register)
- Headers de segurança: CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy

### CSP bloqueia inline scripts do Astro

A política `script-src 'self'` no middleware (`src/middleware.ts`) **bloqueia os inline scripts** que o Astro usa para hidratação de componentes React (`<astro-island>`, definição de `Astro.load`, etc.).

**Sintoma:** Todos os islands React com `client:load` falham silenciosamente — o HTML SSR é renderizado mas os componentes nunca hidratam. Nenhum erro visível no console do navegador, apenas avisos de CSP no console.

**Diagnóstico:** Verificar se `<astro-island>` mantém o atributo `ssr` após carregamento da página. Se sim, a hidratação não ocorreu. Usar devtools ou `page.evaluate(() => document.querySelector('astro-island').hasAttribute('ssr'))`.

**Fix:** Adicionar `'unsafe-inline'` ao `script-src`:
```
script-src 'self' 'unsafe-inline'
```

**Localização do código:** `src/middleware.ts:180`

## Testes

### Unitários (Vitest)

```bash
pnpm test:run          # Execução única
pnpm test:coverage     # Com relatório
```

**Cobertura alvo:** lines 80%, functions 75%, branches 70%

**Padrões:**
- DB mockado com `vi.mock('@/core/lib/db')`
- Testes ficam em `__tests__/` ao lado do arquivo testado

### E2E (Playwright)

```bash
pnpm test:e2e
pnpm test:e2e:dev      # Com servidor dev automático
```

## Path Aliases

```json
{
  "@/*": ["./src/*"],
  "@core/*": ["./src/core/*"],
  "@modules/*": ["./src/modules/*"]
}
```

## Estratégia de Branches

- `production`: Branch principal, sempre pronta para produção
- `develop`: Integração de funcionalidades
- `feat/*`, `fix/*`, `refactor/*`, `chore/*`: Branches de trabalho

## Release & Deploy

Deploy controlado por tags semânticas:

```bash
git tag v1.0.0
git push origin v1.0.0
```

O CI detecta a tag, executa lint, testes, build e deploy para Cloudflare Workers.

| Tipo | Exemplo |
|------|---------|
| Nova feature | `v1.1.0` |
| Hotfix | `v1.1.1` |
| Breaking change | `v2.0.0` |
