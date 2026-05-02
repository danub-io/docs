---
title: "Catálogo de Componentes"
---



## Componentes Astro (Estáticos)

Componentes puramente de apresentação, sem interatividade no cliente.

| Componente | Path | Props | Descrição |
|-----------|------|-------|-----------|
| `Layout` | `src/core/layouts/Layout.astro` | `title`, `description` | Layout base com meta tags e SEO |
| `Navbar` | `src/core/layouts/Navbar.astro` | (categorias do service) | Navegação principal com menu mobile |
| `Footer` | `src/core/layouts/Footer.astro` | — | Rodapé global |
| `BottomNav` | `src/core/layouts/BottomNav.astro` | — | Navegação inferior mobile |
| `LaptopsList` | `src/modules/laptops/components/LaptopsList.astro` | `products: Product[]` | Grid de laptops |
| `LaptopsFilter` | `src/modules/laptops/components/LaptopsFilter.astro` | `categories: string[]` | Filtro lateral |
| `LaptopsHeader` | `src/modules/laptops/components/LaptopsHeader.astro` | `total: number` | Cabeçalho com contagem |
| `ReviewFeed` | `src/modules/community/components/ReviewFeed.astro` | `reviews: ExternalReview[]` | Feed de reviews |
| `CommunityHeader` | `src/modules/community/components/CommunityHeader.astro` | — | Cabeçalho da comunidade |
| `ReviewHero` | `src/modules/reviews/components/ReviewHero.astro` | `product: Product` | Hero da página de review |
| `ReviewWhereToBuy` | `src/modules/reviews/components/ReviewWhereToBuy.astro` | `affiliates: any[]` | Tabela de preços |
| `ReviewVerdict` | `src/modules/reviews/components/ReviewVerdict.astro` | `product: Product` | Veredito do review |
| `CompareGrid` | `src/modules/compare/components/CompareGrid.astro` | `products: Product[]` | Grid de comparação |
| `CompareHeader` | `src/modules/compare/components/CompareHeader.astro` | `count: number` | Cabeçalho da comparação |

## Componentes React (Islands)

Componentes interativos que hidratam no cliente.

| Componente | Path | Props | Uso |
|-----------|------|-------|-----|
| `Badge` | `src/core/ui/badge.tsx` | `variant`, `className`, `children` | Selos e tags |
| `Button` | `src/core/ui/button.tsx` | `variant`, `size`, `disabled` | Botões interativos |
| `Card` | `src/core/ui/card.tsx` | `size`, subcomponentes | Cards de conteúdo |
| `Progress` | `src/core/ui/progress.tsx` | `value`, `children` | Barras de progresso |

> **Nota:** Componentes UI usam Base UI (Radix) como primitivas e seguem o padrão shadcn/ui.
