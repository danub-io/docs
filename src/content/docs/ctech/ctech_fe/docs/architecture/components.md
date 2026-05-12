---
title: "Catálogo de Componentes"
---

> **Nota:** Os componentes de comunidade (auth, reviews, feed) são condicionais à variável `COMMUNITY_ENABLED`. Quando desabilitados, as páginas redirecionam para 404 e as API routes retornam 404.



## Componentes Astro (Estáticos)

Componentes puramente de apresentação, sem interatividade no cliente.

| Componente | Path | Props | Descrição |
|-----------|------|-------|-----------|
| `Layout` | `src/core/layouts/Layout.astro` | `title`, `description` | Layout base da aplicação |
| `Navbar` | `src/core/layouts/Navbar.astro` | (categorias do service) | Navegação superior |
| `Footer` | `src/core/layouts/Footer.astro` | — | Rodapé da aplicação |
| `Icon` | `src/core/ui/Icon.astro` | `name`, `class` | Componente padrão para ícones SVG (Material Symbols) |
| `CategoryIcon` | `src/core/ui/CategoryIcon.astro` | `name`, `class` | Ícones SVG específicos por categoria |
| `Breadcrumbs` | `src/core/ui/Breadcrumbs.astro` | `items: { label, href? }[]` | Navegação estrutural (migalhas de pão). Mobile: apenas link anterior. Desktop: trilha completa com Schema.org `BreadcrumbList` |
| `CartaoImprensa` | `src/core/ui/reviews/CartaoImprensa.astro` | `review: Avaliacao` | Card de análise da imprensa com link externo e ícone `open_in_new` |
| `Destaque` | `src/modules/inicio/components/Destaque.astro` | `product: Product` | Seção de destaque da Landing Page |
| `Categorias` | `src/modules/inicio/components/Categorias.astro` | `categories: Categoria[]` | Grid de categorias na Home |
| `Recentes` | `src/modules/inicio/components/Recentes.astro` | `products: Product[]` | Seção "Recentes" com `server:defer` |
| `ProdutoDestaque` | `src/modules/produto/components/ProdutoDestaque.astro` | `product: Product` | Hero da página do produto |
| `ProdutoOndeComprar` | `src/modules/produto/components/ProdutoOndeComprar.astro` | `product: Product` | Seção onde comprar e ofertas |
| `ProdutoVeredito` | `src/modules/produto/components/ProdutoVeredito.astro` | `product: Product` | Veredito técnico e notas |
| `ProdutoEspecificacoes` | `src/modules/produto/components/ProdutoEspecificacoes.astro` | `product: Product` | Especificações técnicas detalhadas |
| `ProdutoFontes` | `src/modules/produto/components/ProdutoFontes.astro` | `reviews: Avaliacao[]` | Análises da imprensa e fontes externas |
| `ProdutoAvaliacoesUsuarios` | `src/modules/comunidade/reviews/components/ProdutoAvaliacoesUsuarios.astro` | `reviews: Avaliacao[]` | Avaliações de usuários na página do produto |
| `CardGuia` | `src/modules/guia/components/CardGuia.astro` | `guia: Guia` | Card de guia de recomendação (ícone, título, descrição) com link para `/guia/{slug}` |
| `GrupoGuias` | `src/modules/guia/components/GrupoGuias.astro` | `grupo: GuiaGrupo` | Seção temática com grid/carrossel de `CardGuia` |
| `CabecalhoGuia` | `src/modules/guia/components/CabecalhoGuia.astro` | `titulo: string, total: number` | Cabeçalho com título, badge de contagem e descrição editorial |
| `CartaoProdutoCategoria` | `src/modules/categoria/components/CartaoProdutoCategoria.astro` | `product: Product` | Card de produto para guias: imagem, nota semântica, título, marca, tier badge |
| `GradeComparacao` | `src/modules/comparar/components/GradeComparacao.astro` | `products: Product[]` | Grid de comparação |
| `CabecalhoComparacao` | `src/modules/comparar/components/CabecalhoComparacao.astro` | `count: number` | Cabeçalho da comparação |
| `FeedAvaliacoes` | `src/modules/comunidade/feed/components/FeedAvaliacoes.astro` | `reviews: AvaliacaoComunidade[]` | Feed de avaliações da comunidade |
| `CabecalhoComunidade` | `src/modules/comunidade/feed/components/CabecalhoComunidade.astro` | — | Cabeçalho da página comunidade |
| `BarraBusca` | `src/modules/busca/components/BarraBusca.astro` | `termo?: string` | Input de busca |
| `FiltrosBusca` | `src/modules/busca/components/FiltrosBusca.astro` | `categorias: string[], ativos: FiltrosAtivos` | Filtros de busca |
| `FiltroAtivo` | `src/modules/busca/components/FiltroAtivo.astro` | `filtro: string, valor: string` | Tag de filtro ativo removível |
| `GradeResultados` | `src/modules/busca/components/GradeResultados.astro` | `products: Product[]` | Grid de resultados da busca |
| `PaginacaoBusca` | `src/modules/busca/components/PaginacaoBusca.astro` | `pagina: number, totalPaginas: number` | Paginação dos resultados |
| `ResultadosBusca` | `src/modules/busca/components/ResultadosBusca.astro` | `results: ResultadoBusca` | Container de resultados (título + contagem + grid + paginação) |
| `DestacarTermo` | `src/modules/busca/components/DestacarTermo.astro` | `texto: string, termo: string` | Destaca o termo buscado no texto |
| `VazioBusca` | `src/modules/busca/components/VazioBusca.astro` | `termo?: string` | Empty state da busca |

## Componentes React (Islands)

Componentes interativos que hidratam no cliente. Apenas estes usam `client:*` diretivas.

| Componente | Path | Props | Hidratação | Descrição |
|-----------|------|-------|-----------|----------|
| `Badge` | `src/core/ui/badge.tsx` | `variant`, `className`, `children` | SSR (sem `client:*`) | Selos e tags |
| `Button` | `src/core/ui/button.tsx` | `variant`, `size`, `disabled` | SSR (sem `client:*`) | Botões |
| `Card` | `src/core/ui/card.tsx` | `size`, subcomponentes | SSR (sem `client:*`) | Cards de conteúdo |
| `Progress` | `src/core/ui/progress.tsx` | `value`, `children` | SSR (sem `client:*`) | Barras de progresso |
| `CartaoAvaliacaoColapsavel` | `src/modules/comunidade/reviews/components/CartaoAvaliacaoColapsavel.tsx` | `review: Avaliacao` | `client:visible` | Card de avaliação de usuário com collapsible para texto longo |
| `LoginDialog` | `src/modules/comunidade/auth/components/LoginDialog.tsx` | — | `client:load` | Modal de login/registro com abas |
| `UserMenu` | `src/modules/comunidade/auth/components/UserMenu.tsx` | — | `client:load` | Menu do usuário autenticado |
| `PainelDashboard` | `src/modules/comunidade/auth/components/PainelDashboard.tsx` | — | `client:load` | Dashboard do painel do usuário |
| `Collapsible` | `src/core/ui/collapsible.tsx` | `children` | via componente pai | Primitiva de expandir/recolher |
| `NavDrawer` | `src/core/ui/nav-drawer.tsx` | — | `client:load` | Drawer de navegação mobile |
| `SearchCommand` | `src/core/ui/search-command.tsx` | — | `client:idle` | Paleta de busca (CMD+K) |

> **Nota:** Componentes UI usam `@base-ui/react` (MUI primitives) e seguem o padrão shadcn/ui, **não** Radix.

## Iconografia

O projeto utiliza **SVGs internos** via o componente `Icon` para garantir consistência visual e performance (evitando dependências externas como fontes do Google).

### Como usar o componente `Icon`

```astro
---
import Icon from '@/core/ui/Icon.astro';
---

<!-- Ícone simples -->
<Icon name="add_circle" class="w-5 h-5 text-primary" />

<!-- Ícone com cor do texto herdada -->
<Icon name="shopping_cart" class="w-6 h-6" />
```

### Lista de Ícones Suportados
Os ícones estão mapeados em `src/core/ui/Icon.astro`. Nomes comuns incluem:
- `close`, `menu`, `open_in_new`, `chevron_right`, `arrow_forward`, `arrow_back`
- `expand_more`, `expand_less` (chevron para expandir/recolher conteúdo)
- `add_circle`, `do_not_disturb_on`
- `shopping_cart`, `storefront`
- `star`, `thumb_up`, `groups`

