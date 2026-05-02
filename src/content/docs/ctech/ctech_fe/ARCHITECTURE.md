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
│   ├── layouts/                 # (Agora vazios ou genéricos)
│   ├── lib/                     # Conexão DB, utilitários (cn), logger
│   ├── services/                # Serviços globais (categoryService com cache)
│   ├── styles/                  # CSS Global e design tokens
│   └── types/                   # Schemas Zod e tipos TypeScript
│
├── modules/                     # Domínios isolados por funcionalidade
│   ├── laptops/                 # Listagem e filtros de laptops
│   ├── compare/                 # Motor de comparação de produtos
│   ├── product/                 # Páginas de detalhes do produto (Single Product)
│   │   ├── components/          # ProductHero, ProductVerdict, ProductSpecs, ProductSources, ProductUserReviews, PressReviewCard, ProductWhereToBuy
│   │   └── services/            # productService
│   ├── community/               # Feed da comunidade
│   └── home/                    # Página inicial (Altamente Modularizada)
│       ├── components/          # Navbar, Footer, Layout, Hero, Categories, Trending
│       └── services/            # homeService
│
├── pages/                       # Camada de roteamento (Astro)
│   ├── index.astro              # Home (Orquestra componentes de @modules/home)
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
  --font-heading: 'Inter', sans-serif;
  --font-body: 'Inter', sans-serif;
  --radius-DEFAULT: 0.25rem;
  --radius-full: 9999px;
}
```

## Padrões de Layout e Espaçamento

Para manter a consistência visual entre páginas (LP, Produto, etc.), utilizamos classes e variáveis de layout padronizadas em `src/core/styles/global.css`:

### Container de Página (`.layout-container`)

Todas as páginas principais devem envolver seu conteúdo principal com a classe `.layout-container`. Esta classe garante:
- **Largura Máxima:** `1280px` (`--spacing-container-max`).
- **Alinhamento:** Centralizado horizontalmente (`mx-auto`).
- **Margens Laterais (Edge):**
    - Mobile: `16px` (`px-4`).
    - Desktop (>=768px): `32px` (`--spacing-margin-edge`).

### Espaçamento entre Itens (Gutter)

- **Gutter Padrão:** O espaçamento entre itens em grids ou listas deve seguir o token `--spacing-gutter: 24px`, geralmente aplicado via classe Tailwind `gap-6`.
- **Gap entre Seções:** O espaçamento vertical entre grandes blocos de conteúdo segue `--spacing-section-gap: 80px`.

### Padronização de Boxes e Padding (`.layout-boxed`, `.layout-box-padding`)

Para garantir que todos os elementos contidos em "boxes" (cards, seções de veredito, especificações) tenham uma hierarquia visual consistente, utilizamos:

- **`.layout-box-padding`:** Define um padding interno padrão de `24px` (vinculado ao token `--spacing-box-padding`). Este é o padrão ouro para conteúdo textual dentro de containers.
- **`.layout-boxed`:** Uma classe utilitária que combina o fundo padrão (`bg-surface-container-lowest`), borda (`border-surface-variant`), arredondamento (`rounded-xl`) e o padding padrão definido no token.

Deve ser usado em:
- Cards de produto (Trending, Listagens).
- Blocos de Veredito e Scores.
- Qualquer seção que exija destaque visual dentro de uma borda.

## Ícones e Tipografia

Para garantir máxima confiabilidade e performance:

- **Ícones:** Não utilizamos fontes de ícones (como Material Symbols) que dependem de ligaduras. Em vez disso, usamos **SVGs Inline** ou o componente `CategoryIcon.astro`. Isso evita que nomes de ícones apareçam como texto se a fonte falhar.
- **Tipografia:** Utilizamos a fonte **Inter** (via `@fontsource-variable/inter` e fallback Google Fonts) para garantir uma interface moderna e legível em todos os dispositivos.


### SEO e Performance

#### Image Optimization (`astro:assets`)
- **Padrão:** Sempre utilize o componente `<Image />` de `astro:assets` para imagens locais e remotas.
- **Remote Images:** Para imagens externas (Turso/Cloudinary), utilize o atributo `inferSize` para que o Astro processe as dimensões automaticamente, garantindo WebP/Avif e evitando Cumulative Layout Shift (CLS).
- **Configuração:** Novos domínios de imagem devem ser adicionados ao `remotePatterns` no `astro.config.mjs`.

#### Loading States (`server:defer`)
- **Conceito:** Componentes que dependem de dados lentos (como preços de afiliados ou APIs externas) devem usar a diretiva `server:defer` (Astro 5+).
- **Fallback:** Sempre forneça um `slot="fallback"` com um skeleton loader animado (`animate-pulse`) para manter o design estável enquanto os dados são carregados.
- **Exemplo:** Veja `ProductWhereToBuy` em `[slug].astro`.

### Meta Tags e Open Graph


- Meta tags e Open Graph definidas no `Layout.astro`
- Geração de sitemap automática via `@astrojs/sitemap`
- URLs canônicas configuradas

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
