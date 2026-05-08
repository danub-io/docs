---
title: "Changelog"
---

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-br/1.1.0/),
e este projeto segue o [Semantic Versioning](https://semver.org/lang/pt-BR/).

## [Unreleased]

### Adicionado
- **Sistema de Tipografia (RT-inspired):** 14 classes utilitárias `type-*` em
  `src/core/styles/global.css`
- **Tokens de fonte:** `--font-body` e `--font-display` no `@theme inline` do Tailwind
- **Cache de slugs (1h):** `servicoProduto.obterTodosSlugs()`
- **Cache de categorias com guias (30min):** `servicoGuia.obterCategoriasComGuias()`
- **Função agregada `obterProdutoCompleto`:** Paraleliza 3 consultas (produto + reviews + afiliados)
- **Hub de Guias de Recomendação:** Páginas de categoria como hubs editoriais com cards de guias
- **Rota `/guia/[slug]`:** Páginas individuais de guia com Schema.org `ItemList`
- **Tabelas `Guias` e `Guia_Produtos`:** Entidades no Turso para o sistema de guias
- **`servicoGuia.ts`:** Serviço completo com 4 métodos de consulta
- **Componentes:** `CardGuia.astro`, `GrupoGuias.astro`, `CabecalhoGuia.astro`
- **Avaliações de Usuários:** Seção na página do produto + página `/produto/[slug]/user-reviews`
- **Componentes:** `ProductUserReviews.astro`, `PressReviewCard.astro`
- **`review_type` na tabela Reviews:** Separa reviews de imprensa (`critic`) e de usuários (`user`)
- **Módulo de Produto:** Substituição do módulo `reviews` — rota `/produto/[slug]`
- **ProductSpecs.astro:** Exibição de especificações técnicas
- **Modularização:** Módulo `home` com Layout, Navbar, Footer, Hero, Categories, Trending
- **CategoryIcon.astro:** Ícones SVG por categoria (remove dependência de fontes externas)
- **CONTRIBUTING.md:** Guia de contribuição com commits, branches e PRs
- **DATA_LAYER.md:** Documentação do fluxo de dados
- **docs/:** Subdocumentos de arquitetura, deploy e troubleshooting
- Testes unitários para UI, logger, ProductSchema, servicos
- **Removidos:** `BarraFiltros.astro`, `SecaoTier.astro`, `CabecalhoCategoria.astro`, `EstadoVazio.astro`, `PainelCategoria.astro`

### Alterado
- **`--spacing-section-gap`:** 48px → **32px**
- **`--spacing-margin-edge`:** Removido. Layout usa `px-4` (`1rem`)
- **HeroCarousel:** Memoização do plugin Autoplay com `useMemo`
- **NavDrawer:** `nativeButton={false}` e controle de estado explícito
- **ProductVerdict.astro:** Agora aceita `userScore` e `userReviewCount` (nota dinâmica)

### Otimizado
- **Página `/produto/[slug]`:** `obterProdutoCompleto` reduz 3 queries sequenciais para 1 paralelizada

### Corrigido
- **CSP bloqueava hidratação React (`client:load`):** Adicionado `'unsafe-inline'` ao `script-src`
- **"Ligature Leak":** Material Symbols → SVGs Inline
- **Design Tokens:** `--radius-full` → `9999px`
- **Conectividade DB:** Fallback para `process.env` no `db.ts`
- **Layout LP:** Quebra de linha no link "Ver Todas" e scrollbars
- **Testes:** Nome de função incorreto, assertivas SQL desatualizadas

### Documentação
- **`docs/architecture/components.md`**: Reescrito com componentes atuais
- **`docs/architecture/islands.md`**: Estado real de hidratação
- **`docs/architecture/busca.md`**: Nova documentação de busca full-text
- **`docs/security/seguranca.md`**: CSP, headers, SQL injection
- **`docs/development/setup-local.md`**: Setup com Turso
- **`ARCHITECTURE.md`**: Limpeza de duplicações
- **`README.md`**: Seção de docs expandida
- **`ADRs/`**: 4 Architecture Decision Records

### Melhorado
- Cobertura de testes: lines 60% → 80%, functions 60% → 75%, branches 50% → 70%

---

## [1.0.6] - 2026-05-07

### Adicionado
- Efeito peek nas categorias + soft border muted/50
- Hero com glassmorphism, border beam na badge, progress indicators lineares
- Card unificado com shadcn, badge de nota suave, shine border p/ nota > 9, skeleton loading

### Corrigido
- Hero em 2 blocos com vidro separado, badge na posição original, indicadores menores

### Alterado
- Move hero text para abaixo do carrossel, categorias maiores, remove padding extra
- Migra formulário de criar análise para modal com Dialog e Slider

---

## [1.0.5] - 2026-05-06

### Corrigido
- Vulnerabilidade de redirecionamento não validado (security)
- Replace `<Image />` com `<img>` nativo para corrigir imagens quebradas em produção

### Alterado
- Refatora footer e melhorias em componentes de produto

---

## [1.0.4] - 2026-05-05

### Corrigido
- Replace `<Image />` com `<img>` nativo para corrigir imagens quebradas em produção
- Adiciona fallback `process.env` para Cloudflare Workers runtime secrets

---

## [1.0.3] - 2026-05-05

### Corrigido
- Configura 5 secrets no Worker, corrige sitemap warning e atualiza actions para v5

### Documentação
- Adiciona notas de verificação de secrets e redeploy na documentação de deploy

---

## [1.0.2] - 2026-05-05

### Corrigido
- Adiciona `account_id` explícito no `wrangler.jsonc` para CI

---

## [1.0.1] - 2026-05-05

### Corrigido
- Usa `pnpm run deploy` no CI para evitar conflito com comando built-in do pnpm

---

## [1.0.0] - 2026-05-05

### Adicionado
- Migração para Cloudflare Pages com autenticação completa
- Rotas sem prefixo e novo sistema de labels
- Sistema de busca full-text
- Comparação interativa de produtos e biblioteca de componentes UI
- Migração UI para ShadCN design system
- Redesign e rebranding para TECHCRITIC
- Layout mobile-first estilo Rotten Tomatoes

### Corrigido
- Remove mode obsoleto do adapter cloudflare (Options v13)
- Lockfile desatualizado, fallback env em servicoCriptografia
- 19 TypeScript errors para CI com `tsc --noEmit`
- Base URL deprecada no tsconfig
- Diversos erros de configuração e setup inicial

### Alterado
- Refatora página de comparação, migra busca/categoria, adiciona componente NotaBadge
- Paraleliza queries e adiciona cache no frontend para reduzir row reads
- Atualiza tema para MD3 light e refatora componentes UI
- Redesign homepage para layout editorial data-driven
- Remove componentes não utilizados

---

## [0.1.0] - 2026-04-15

### Adicionado
- Setup inicial do projeto com Astro 6 + React 19
- Tailwind CSS v4 com design tokens customizados
- Componentes shadcn/ui (Badge, Button, Card, Progress)
- Layouts: Navbar, Footer, BottomNav
- Páginas: Home, Laptops, Compare, Community, Reviews
- Integração com banco Turso (libsql)
- Serviços: category, laptop, review, compare, community, home
- Validação de dados com Zod
- Middleware de segurança (CSP, HSTS, X-Frame-Options)
- CI/CD com GitHub Actions
- Testes unitários iniciais com Vitest (cobertura 60%)
- Testes E2E com Playwright
- Documentação inicial (README.md, ARCHITECTURE.md)
