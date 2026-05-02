---
title: "Catálogo de Componentes"
---



## Componentes Astro (Estáticos)

Componentes puramente de apresentação, sem interatividade no cliente.

| Componente | Path | Props | Descrição |
|-----------|------|-------|-----------|
| `Layout` | `src/core/layouts/Layout.astro` | `title`, `description` | Layout base da aplicação |
| `Navbar` | `src/core/layouts/Navbar.astro` | (categorias do service) | Navegação superior |
| `Footer` | `src/core/layouts/Footer.astro` | — | Rodapé da aplicação |
| `Hero` | `src/modules/home/components/Hero.astro` | `product` | Seção de destaque da Landing Page |
| `Categories` | `src/modules/home/components/Categories.astro` | `categories` | Grid de categorias na Home |
| `Trending` | `src/modules/home/components/Trending.astro` | `products` | Seção "Em Alta" na Home |
| `Icon` | `src/core/ui/Icon.astro` | `name`, `class` | Componente padrão para ícones SVG (Material Symbols) |
| `CategoryIcon` | `src/core/ui/CategoryIcon.astro` | `name`, `class` | Ícones SVG específicos por categoria |
| `BottomNav` | `src/core/layouts/BottomNav.astro` | — | Navegação inferior mobile |
| `LaptopsList` | `src/modules/laptops/components/LaptopsList.astro` | `products: Product[]` | Grid de laptops |
| `LaptopsFilter` | `src/modules/laptops/components/LaptopsFilter.astro` | `categories: string[]` | Filtro lateral |
| `LaptopsHeader` | `src/modules/laptops/components/LaptopsHeader.astro` | `total: number` | Cabeçalho com contagem |
| `ReviewFeed` | `src/modules/community/components/ReviewFeed.astro` | `reviews: ExternalReview[]` | Feed de reviews |
| `CommunityHeader` | `src/modules/community/components/CommunityHeader.astro` | — | Cabeçalho da comunidade |
| `ProductHero` | `src/modules/product/components/ProductHero.astro` | `product: Product` | Hero da página do produto |
| `ProductWhereToBuy` | `src/modules/product/components/ProductWhereToBuy.astro` | `product: Product` | Seção onde comprar e ofertas |
| `ProductVerdict` | `src/modules/product/components/ProductVerdict.astro` | `product: Product` | Veredito técnico e notas |
| `ProductSpecs` | `src/modules/product/components/ProductSpecs.astro` | `product: Product` | Especificações técnicas detalhadas |
| `ProductSources` | `src/modules/product/components/ProductSources.astro` | `reviews: SourceReview[]` | Análises da imprensa e fontes externas |
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
- `close`, `menu`, `open_in_new`, `chevron_right`, `arrow_forward`
- `add_circle`, `do_not_disturb_on`
- `shopping_cart`, `storefront`
- `star`, `thumb_up`, `groups`

