---
title: "Component Catalog"
---

> **Note:** Community components (auth, reviews, feed) are conditional on the `COMMUNITY_ENABLED` flag. When disabled, pages redirect to 404 and API routes return 404.

## Astro Components (Static)

Purely presentational components with no client interactivity.

| Component | Path | Props | Description |
|-----------|------|-------|-------------|
| `Layout` | `src/core/layouts/Layout.astro` | `title`, `description` | Base application layout |
| `Navbar` | `src/core/layouts/Navbar.astro` | (categories from service) | Top navigation |
| `Footer` | `src/core/layouts/Footer.astro` | — | Application footer |
| `Icon` | `src/core/ui/Icon.astro` | `name`, `class` | Default SVG icon component (Material Symbols) |
| `CategoryIcon` | `src/core/ui/CategoryIcon.astro` | `name`, `class` | Category-specific SVG icons |
| `Breadcrumbs` | `src/core/ui/Breadcrumbs.astro` | `items: { label, href? }[]` | Structural breadcrumb navigation. Mobile: previous link only. Desktop: full trail with Schema.org `BreadcrumbList` |
| `CartaoImprensa` | `src/core/ui/reviews/CartaoImprensa.astro` | `review: Avaliacao` | Press review card with external link and `open_in_new` icon |
| `Destaque` | `src/modules/inicio/components/Destaque.astro` | `product: Product` | Landing page featured section |
| `Categorias` | `src/modules/inicio/components/Categorias.astro` | `categories: Categoria[]` | Category grid on Home |
| `Recentes` | `src/modules/inicio/components/Recentes.astro` | `products: Product[]` | "Recent" section with `server:defer` |
| `ProdutoDestaque` | `src/modules/produto/components/ProdutoDestaque.astro` | `product: Product` | Product page hero |
| `ProdutoOndeComprar` | `src/modules/produto/components/ProdutoOndeComprar.astro` | `product: Product` | Where to buy and pricing section |
| `ProdutoVeredito` | `src/modules/produto/components/ProdutoVeredito.astro` | `product: Product` | Technical verdict and ratings |
| `ProdutoEspecificacoes` | `src/modules/produto/components/ProdutoEspecificacoes.astro` | `product: Product` | Detailed technical specifications |
| `ProdutoFontes` | `src/modules/produto/components/ProdutoFontes.astro` | `reviews: Avaliacao[]` | Press reviews and external sources |
| `ProdutoAvaliacoesUsuarios` | `src/modules/comunidade/reviews/components/ProdutoAvaliacoesUsuarios.astro` | `reviews: Avaliacao[]` | User reviews on product page |
| `CardGuia` | `src/modules/guia/components/CardGuia.astro` | `guia: Guia` | Recommendation guide card (icon, title, description) with link to `/guia/{slug}` |
| `GrupoGuias` | `src/modules/guia/components/GrupoGuias.astro` | `grupo: GuiaGrupo` | Themed section with grid/carousel of `CardGuia` |
| `CabecalhoGuia` | `src/modules/guia/components/CabecalhoGuia.astro` | `titulo: string, total: number` | Header with title, count badge, and editorial description |
| `CartaoProdutoCategoria` | `src/modules/categoria/components/CartaoProdutoCategoria.astro` | `product: Product` | Product card for guides: image, semantic rating, title, brand, tier badge |
| `GradeComparacao` | `src/modules/comparar/components/GradeComparacao.astro` | `products: Product[]` | Comparison grid |
| `CabecalhoComparacao` | `src/modules/comparar/components/CabecalhoComparacao.astro` | `count: number` | Comparison header |
| `FeedAvaliacoes` | `src/modules/comunidade/feed/components/FeedAvaliacoes.astro` | `reviews: AvaliacaoComunidade[]` | Community review feed |
| `CabecalhoComunidade` | `src/modules/comunidade/feed/components/CabecalhoComunidade.astro` | — | Community page header |
| `BarraBusca` | `src/modules/busca/components/BarraBusca.astro` | `termo?: string` | Search input |
| `FiltrosBusca` | `src/modules/busca/components/FiltrosBusca.astro` | `categorias: string[], ativos: FiltrosAtivos` | Search filters |
| `FiltroAtivo` | `src/modules/busca/components/FiltroAtivo.astro` | `filtro: string, valor: string` | Removable active filter tag |
| `GradeResultados` | `src/modules/busca/components/GradeResultados.astro` | `products: Product[]` | Search results grid |
| `PaginacaoBusca` | `src/modules/busca/components/PaginacaoBusca.astro` | `pagina: number, totalPaginas: number` | Results pagination |
| `ResultadosBusca` | `src/modules/busca/components/ResultadosBusca.astro` | `results: ResultadoBusca` | Results container (title + count + grid + pagination) |
| `DestacarTermo` | `src/modules/busca/components/DestacarTermo.astro` | `texto: string, termo: string` | Highlights the searched term in text |
| `VazioBusca` | `src/modules/busca/components/VazioBusca.astro` | `termo?: string` | Search empty state |

## React Components (Islands)

Interactive components that hydrate on the client. Only these use `client:*` directives.

| Component | Path | Props | Hydration | Description |
|-----------|------|-------|-----------|-------------|
| `Badge` | `src/core/ui/badge.tsx` | `variant`, `className`, `children` | SSR (no `client:*`) | Badges and tags |
| `Button` | `src/core/ui/button.tsx` | `variant`, `size`, `disabled` | SSR (no `client:*`) | Buttons |
| `Card` | `src/core/ui/card.tsx` | `size`, subcomponents | SSR (no `client:*`) | Content cards |
| `Progress` | `src/core/ui/progress.tsx` | `value`, `children` | SSR (no `client:*`) | Progress bars |
| `CartaoAvaliacaoColapsavel` | `src/modules/comunidade/reviews/components/CartaoAvaliacaoColapsavel.tsx` | `review: Avaliacao` | `client:visible` | User review card with collapsible for long text |
| `LoginDialog` | `src/modules/comunidade/auth/components/LoginDialog.tsx` | — | `client:load` | Login/register modal with tabs |
| `UserMenu` | `src/modules/comunidade/auth/components/UserMenu.tsx` | — | `client:load` | Authenticated user menu |
| `PainelDashboard` | `src/modules/comunidade/auth/components/PainelDashboard.tsx` | — | `client:load` | User dashboard panel |
| `Collapsible` | `src/core/ui/collapsible.tsx` | `children` | via parent component | Expand/collapse primitive |
| `NavDrawer` | `src/core/ui/nav-drawer.tsx` | — | `client:load` | Mobile navigation drawer |
| `SearchCommand` | `src/core/ui/search-command.tsx` | — | `client:idle` | Search palette (CMD+K) |

> **Note:** UI components use `@base-ui/react` (MUI primitives) following the shadcn/ui pattern, **not** Radix.

## Iconography

The project uses **internal SVGs** via the `Icon` component to ensure visual consistency and performance (avoiding external dependencies like Google Fonts).

### How to use the `Icon` component

```astro
---
import Icon from '@/core/ui/Icon.astro';
---

<!-- Simple icon -->
<Icon name="add_circle" class="w-5 h-5 text-primary" />

<!-- Icon with inherited text color -->
<Icon name="shopping_cart" class="w-6 h-6" />
```

### Supported Icon List
Icons are mapped in `src/core/ui/Icon.astro`. Common names include:
- `close`, `menu`, `open_in_new`, `chevron_right`, `arrow_forward`, `arrow_back`
- `expand_more`, `expand_less` (chevron for expand/collapse content)
- `add_circle`, `do_not_disturb_on`
- `shopping_cart`, `storefront`
- `star`, `thumb_up`, `groups`
