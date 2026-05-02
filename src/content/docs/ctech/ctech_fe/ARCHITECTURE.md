---
title: "Arquitetura Frontend — TechReveal (CTECH)"
---



Este documento detalha as decisões arquiteturais, fluxo de dados e padrões de desenvolvimento do frontend.

## Design Modular e Vibecoding

O projeto foi estruturado para manter baixo custo cognitivo para desenvolvimento assistido por IA, com isolamento claro entre módulos.

### Estrutura de Diretórios

```
src/
├── core/                        # Infraestrutura e base do sistema
│   ├── ui/                      # Componentes genéricos (shadcn/ui + Base UI)
│   │   ├── badge.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   └── progress.tsx
│   ├── layouts/                 # Estruturas globais (Navbar, Footer, BottomNav, Layout)
│   ├── lib/                     # Conexão DB, utilitários (cn), logger
│   ├── services/                # Serviços globais (categoryService com cache)
│   ├── styles/                  # CSS Global e design tokens
│   └── types/                   # Schemas Zod e tipos TypeScript
│
├── modules/                     # Domínios isolados por funcionalidade
│   ├── laptops/                 # Listagem e filtros de laptops
│   │   ├── components/          # LaptopsList, LaptopsFilter, LaptopsHeader
│   │   └── services/            # laptopService
│   ├── compare/                 # Motor de comparação de produtos
│   │   ├── components/          # CompareGrid, CompareHeader
│   │   └── services/            # compareService
│   ├── reviews/                 # Páginas de review de produtos
│   │   ├── components/          # ReviewHero, ReviewWhereToBuy, ReviewVerdict
│   │   └── services/            # reviewService
│   ├── community/               # Feed da comunidade
│   │   ├── components/          # ReviewFeed, CommunityHeader
│   │   └── services/            # communityService
│   └── home/                    # Página inicial
│       ├── components/          # (se houver)
│       └── services/            # homeService
│
├── pages/                       # Camada de roteamento (Astro)
│   ├── index.astro              # Home
│   ├── laptops.astro            # Lista de laptops
│   ├── compare.astro            # Comparação
│   ├── community.astro          # Comunidade
│   ├── 404.astro                # Página de erro
│   └── reviews/[slug].astro     # Página dinâmica de review
│
└── middleware.ts                # Segurança (CSP, HSTS)
```

### Metodologia "Vibecoding"

1. **Isolamento de Escopo:** Forneça apenas o contexto do módulo relevante para a IA.
2. **Modificações Locais:** Evite alterar `@core/*` a menos que estritamente necessário.
3. **Contratos Claros:** Componentes em `@modules` recebem dados via props tratadas nas páginas.

## Fluxo de Dados

```
Turso DB (libsql)
    ↑↓ SSR queries (parametrizadas)
    ↓
Services (try/catch → ProductSchema.parse)
    ↓
Pages Astro (chamadas SSR no frontmatter)
    ↓
Componentes Astro/React (props → render)
```

- **Server-Side Rendering:** Todo dado é buscado no frontmatter de páginas Astro
- **Nunca em cliente:** O banco não é acessado no navegador
- **Tratamento de erros:** Serviços retornam `[]` ou `null` em caso de falha
- **Cache:** categoryService usa cache em memória com TTL de 5 minutos

## Islands Architecture

O projeto usa Astro Islands — componentes React interativos ilhados em HTML estático:

| Tipo | Uso | Hidratação |
|------|-----|-----------|
| **Astro nativo** | Layouts, páginas, listas | Zero JS no cliente |
| **React Island** | Progress, Badge dinâmicos | `client:visible` ou `client:idle` |
| **React Interativo** | Filtros, busca, comparação | `client:load` (se necessário) |

### Critério de Escolha

- Prefira **Astro** puro para componentes de apresentação
- Use **React** apenas quando precisar de estado, eventos ou hooks
- Priorize `client:visible` sobre `client:load` para performance

## Estratégia de CSS (Tailwind v4)

- **Mobile First:** Classes base = mobile. `md:`, `lg:` para breakpoints maiores
- **Design Tokens:** Cores e tipografia definidas em `src/core/styles/global.css`
- **Componentes:** Prefira compor classes Tailwind em vez de CSS avulso
- **cn() utility:** Use a função `cn()` para merge condicional de classes

### Sistema de Cores (Design Tokens)

```css
:root {
  --color-primary: #...;
  --color-surface: #...;
  --font-heading: 'Geist', sans-serif;
  --font-body: 'Inter', sans-serif;
  --radius-sm: 0.5rem;
  --radius-md: 0.75rem;
  --radius-xl: 1rem;
}
```

## SEO e Performance

### Meta Tags e Open Graph

- Meta tags e Open Graph definidas no `Layout.astro`
- Geração de sitemap automática via `@astrojs/sitemap`
- URLs canônicas configuradas

### Otimização de Imagens

- Uso de `astro:assets` com Sharp para transformação
- Imagens externas com padrões de URL configurados no `astro.config.mjs`
- Atributos `loading="lazy"` e `decoding="async"`

### Core Web Vitals

- **SSR** reduz First Contentful Paint (FCP)
- **Islands** minimiza JavaScript bloqueante
- **Tailwind** gera CSS purgado (apenas classes usadas)
- **View Transitions** para navegações suaves (quando habilitado)
- **Prefetch** de links via Astro nativo

## Testes

### Unitários (Vitest)

```bash
pnpm test              # Watch mode
pnpm test:run          # Execução única
pnpm test:coverage     # Com relatório
```

**Cobertura alvo:** lines 80%, functions 75%, branches 70%

**Estrutura:** Testes ficam em `__tests__/` ao lado do arquivo testado.

**Padrões:**
- DB mockado com `vi.mock('@/core/lib/db')`
- Console spied para logger
- Componentes React renderizados com Testing Library + jest-dom

### E2E (Playwright)

```bash
pnpm test:e2e
```

Testes em `tests/e2e/` cobrindo fluxos completos do usuário.

> **Nota:** Componentes Astro puros são testados via E2E (não rodam em Vitest).

## Path Aliases

```json
{
  "@/*": ["./src/*"],
  "@core/*": ["./src/core/*"],
  "@modules/*": ["./src/modules/*"]
}
```

## Segurança

- **CSP:** Content Security Policy restritiva no middleware
- **HSTS:** HTTP Strict Transport Security
- **Headers:** X-Frame-Options, X-Content-Type-Options, Referrer-Policy
- **SQL Injection:** Todas as queries usam placeholders parametrizados (`?` + `args`)
- **Banco:** Acesso apenas em SSR (nunca exposto ao cliente)
