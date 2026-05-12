---
title: "Islands Architecture"
---



O Astro usa o conceito de **Islands** — componentes interativos ilhados em HTML estático. Isso minimiza o JavaScript enviado ao cliente.

## Diretrizes

### Prefira Astro para Conteúdo Estático

Componentes que apenas exibem dados (listas, grids, headers) **devem ser Astro**. Eles geram HTML puro sem JavaScript.

### Use React Apenas para Interatividade

Reserve componentes React para:
- Estado local e eventos (`useState`, `useEffect`)
- Hooks e contextos
- Integração com bibliotecas de terceiros

### Estratégia de Hidratação

| Diretiva | Quando usar | Impacto |
|----------|------------|---------|
| `client:load` | Imediatamente necessário (crítico) | Carrega JS na carga inicial |
| `client:visible` | Abaixo da dobra (padrão recomendado) | Carrega quando entra no viewport |
| `client:idle` | Não urgente | Carrega quando o navegador está ocioso |
| `client:media` | Responsivo | Carrega apenas em certos breakpoints |
| `client:only` | SPA-like | Sem SSR, apenas cliente |

### Boas Práticas

```astro
<!-- Mau: React Island para conteúdo estático -->
<ProductList client:load />   ← JS desnecessário

<!-- Bom: Astro nativo, zero JS -->
<ProductList />

<!-- Bom: React apenas quando necessário -->
<CartaoAvaliacaoColapsavel client:visible />
<NavDrawer client:load />
<SearchCommand client:idle />
```

## Estado Atual

O projeto usa majoritariamente componentes **Astro** estáticos (zero JS no cliente). Componentes React UI (Badge, Button, Card, Progress) renderizam em SSR sem hidratação cliente.

**Islands ativas:**

| Componente | Path | Diretiva | Finalidade |
|-----------|------|----------|-----------|
| `CartaoAvaliacaoColapsavel` | `src/modules/comunidade/reviews/components/CartaoAvaliacaoColapsavel.tsx` | `client:visible` | Card de avaliação de usuário com expandir/recolher |
| `NavDrawer` | `src/core/ui/nav-drawer.tsx` | `client:load` | Drawer de navegação mobile |
| `SearchCommand` | `src/core/ui/search-command.tsx` | `client:load` | Paleta de busca (CMD+K) |
| `LoginDialog` | `src/modules/comunidade/auth/components/LoginDialog.tsx` | `client:load` | Modal de login/registro com abas |
| `UserMenu` | `src/modules/comunidade/auth/components/UserMenu.tsx` | `client:load` | Menu do usuário autenticado |
| `PainelDashboard` | `src/modules/comunidade/auth/components/PainelDashboard.tsx` | `client:load` | Dashboard do painel do usuário |
| `ComparadorInteractive` | `src/modules/comparar/components/ComparadorInteractive.tsx` | `client:load` | Comparação interativa de produtos |
| `HeroCarousel` | `src/modules/inicio/components/HeroCarousel.tsx` | `client:load` | Carrossel de produtos em destaque |

> **Regra:** só adicione `client:*` quando houver estado/evento inevitável. Prefira `client:visible` ou `client:idle` sobre `client:load`.

> **Nota:** Todas as islands de autenticação (LoginDialog, UserMenu, PainelDashboard) e reviews (CartaoAvaliacaoColapsavel) são renderizadas condicionalmente — só aparecem quando `COMMUNITY_ENABLED()` retorna `true`. Veja [comunidade.md](./comunidade.md) para detalhes.
