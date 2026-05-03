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
│   ├── ui/                      # Componentes genéricos — React (shadcn/ui) e Astro (ícones, navegação)
│   │   ├── reviews/             # CartaoImprensa.astro, CartaoAvaliacaoColapsavel.tsx
│   │   ├── Icon.astro           # Ícones SVG inline (Material Symbols)
│   │   ├── CategoryIcon.astro   # Ícones SVG por categoria de produto
│   │   └── Breadcrumbs.astro    # Navegação estrutural (migalhas de pão)
│   ├── layouts/                 # Layout, Navbar, Footer
│   ├── lib/                     # Conexão DB, utilitários (cn, corNota), logger
│   ├── services/                # Serviços globais com cache (servicoCatalogo, servicoProduto, servicoGuia)
│   ├── styles/                  # CSS Global e design tokens
│   └── types/                   # Schemas Zod e tipos TypeScript (product, avaliacao)
│
├── modules/                     # Domínios isolados por funcionalidade
│   ├── inicio/                  # Página inicial (Hero, Categorias, Tendencias)
│   ├── produto/                 # Páginas de detalhes do produto (obterProdutoCompleto)
│   ├── comparar/                # Motor de comparação de produtos
│   ├── comunidade/              # Feed da comunidade
│   ├── categoria/               # Páginas de categoria de produtos (filtros server-side via query params, agrupamento por tier)
│   └── guia/                    # Guias de recomendação editoriais (cards, grupos, páginas individuais)
│
├── pages/                       # Camada de roteamento (Astro)
│   ├── index.astro              # Home (orquestra componentes de @modules/inicio)
│   ├── comparar.astro           # /comparar (orquestra componentes de @modules/comparar)
│   ├── comunidade.astro         # /comunidade (orquestra componentes de @modules/comunidade)
│   ├── categoria/[categoria].astro
│   ├── produto/[slug].astro     # /produto/[slug]
│   ├── produto/[slug]/reviews.astro        # Reviews de imprensa
│   ├── produto/[slug]/user-reviews.astro   # Avaliações de usuários
│   └── guia/[slug].astro        # /guia/[slug]
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
- **Componentes com `server:defer`** podem buscar dados próprios (ex: Tendencias, ProdutoOndeComprar)
- **Tratamento de erros:** Serviços retornam `[]` ou `null` em caso de falha
- **Cache em memória:** Map-based TTL cache em servicoCatalogo (5min), servicoProduto.obterTodosSlugs (1h), servicoGuia (30min), servicoInicio (2min)
- **Função agregada:** `servicoProduto.obterProdutoCompleto()` paraleliza 3 queries (produto + reviews críticas + afiliados) para eliminar N+1 na página `/produto/[slug]`

## Islands Architecture

O projeto usa Astro Islands — componentes React interativos ilhados em HTML estático:

| Tipo | Uso | Hidratação |
|------|-----|-----------|
| **Astro nativo** | Layouts, páginas, listas | Zero JS no cliente |
| **React Island** | Progress, Badge, CartaoAvaliacaoColapsavel | `client:visible` ou `client:idle` |
| **React Interativo** | NavDrawer, SearchCommand | `client:load` / `client:idle` |

### Critério de Escolha

- Prefira **Astro** puro para componentes de apresentação
- Use **React** apenas quando precisar de estado, eventos ou hooks
- Priorize `client:visible` sobre `client:load` para performance

## Estratégia de CSS (Tailwind v4)

- **Mobile First:** Classes base = mobile. `md:`, `lg:` para breakpoints maiores
- **Design Tokens:** Cores e tipografia definidas em `src/core/styles/global.css`
- **Componentes:** Prefira compor classes Tailwind em vez de CSS avulso
- **cn() utility:** Use a função `cn()` para merge condicional de classes

### Cache

Cache em memória com TTL e proteção contra stampede (`pendingFetch` compartilhado). Serviços cacheados incluem `servicoCatalogo` (5min), `servicoProduto.obterTodosSlugs` (1h), `servicoGuia.obterCategoriasComGuias` (30min) e `servicoInicio` (2min).

> Tabela completa em [AGENTS.md](./AGENTS.md) e [DATA_LAYER.md](./DATA_LAYER.md). Cache é invalidado apenas no restart do servidor.

## Padrões de Layout e Espaçamento

Para manter a consistência visual entre páginas, utilizamos classes e variáveis de layout padronizadas em `src/core/styles/global.css`:

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

## Ícones e Tipografia

- **Ícones:** Utilizamos SVGs inline ou o componente `Icon.astro` (nomes Material Symbols).
- **Tipografia:** Fonte **Inter** via `@fontsource-variable/inter`.

## SEO e Performance

### Image Optimization (`astro:assets`)
- **Padrão:** Sempre utilize o componente `<Image />` de `astro:assets` para imagens locais e remotas.
- **Remote Images:** Utilize o atributo `inferSize` para que o Astro processe as dimensões automaticamente, garantindo WebP/Avif e evitando CLS.
- **Configuração:** Novos domínios de imagem devem ser adicionados ao `remotePatterns` no `astro.config.mjs`.

### Loading States (`server:defer`)
- **Conceito:** Componentes que dependem de dados lentos devem usar a diretiva `server:defer` (Astro 5+).
- **Fallback:** Sempre forneça um `slot="fallback"` com um skeleton loader animado (`animate-pulse`).

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
