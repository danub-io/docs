---
title: "Changelog"
---



Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-br/1.1.0/),
e este projeto segue o [Semantic Versioning](https://semver.org/lang/pt-BR/).

## [Unreleased]

### Adicionado
- **Avaliações de Usuários:** Nova seção "Análises de Usuários" na página do produto com até 3 cards + link "Ver todas as análises" para `/produto/[slug]/user-reviews`.
- **Página `/produto/[slug]/user-reviews`:** Página dedicada com todas as avaliações de usuários de um produto.
- **ProductUserReviews.astro:** Componente que exibe cards de avaliações de usuários na página do produto.
- **PressReviewCard.astro:** Componente compartilhado de card para reviews de imprensa (mesmo visual na página do produto e na página dedicada `/produto/[slug]/reviews`).
- **`review_type` na tabela Reviews:** Coluna `review_type` (`'critic' | 'user'`) no banco de dados para separar reviews de imprensa e de usuários.
- **productService.getUserReviewsByProductId():** Novo método para buscar reviews de usuários.
- **ProductVerdict.astro:** Agora aceita `userScore` e `userReviewCount` como props, exibindo a nota real dos usuários (dinâmica, não mais hardcoded).
- **Módulo de Produto (`product`)**: Substituição do antigo módulo `reviews`. A rota agora é `/produto/[slug]`, proporcionando uma experiência de "Single Product Page" completa.
- **ProductSpecs.astro**: Novo componente para exibição detalhada de especificações técnicas extraídas do banco de dados.
- **Modularização Profunda**: O módulo `home` agora contém seus próprios componentes de layout (`Navbar`, `Footer`, `Layout`) e seções específicas (`Hero`, `Categories`, `Trending`).
- **CategoryIcon.astro**: Novo componente para ícones SVG por categoria, substituindo dependência de fontes externas.
- Script de seed para banco de dados Turso, garantindo dados iniciais para a Landing Page.
- Documentação de Ícones e Tipografia no `ARCHITECTURE.md`.

### Corrigido
- **"Ligature Leak"**: Substituição de Material Symbols por SVGs Inline para evitar que nomes de ícones apareçam como texto se a fonte falhar.
- **Design Tokens**: Variável `--radius-full` corrigida para `9999px` para garantir arredondamento perfeito.
- **Conectividade DB**: Adicionado fallback para `process.env` no `db.ts` para melhor compatibilidade com ambientes Node.js/Astro.
- **Layout LP**: Corrigida quebra de linha no link "Ver Todas" e visibilidade de scrollbars em seções horizontais.

### Adicionado (Anterior)
- **CONTRIBUTING.md**: Guia de contribuição com padrões de commits, branches e PRs
- **DATA_LAYER.md**: Documentação do fluxo de dados entre frontend e Turso DB
- **CHANGELOG.md**: Histórico de versões do projeto
- **docs/**: Subdocumentos de arquitetura, deploy e troubleshooting
- Testes unitários para componentes React UI (badge, button, card, progress)
- Testes para logger e validação de ProductSchema
- Testes para `compareService.getTopProducts` e `reviewService.getAffiliatesByProductId`
- Cobertura de erros em serviços existentes (DB error, empty response)

### Corrigido
- Nome incorreto de função em `compareService.test.ts` (`getProductsForComparison` → `getComparisonProducts`)
- Assertiva de SQL em `getSearchSuggestions` test (`status != 'rascunho'` → `status = 'AprovadoM4'`)
- Assertiva de args em `getReviewBySlug` test (1 arg → 3 args da query atual)

### Melhorado
- Cobertura de testes: lines 60% → 80%, functions 60% → 75%, branches 50% → 70%
- Scripts de teste adicionados: `test:coverage`, `test:e2e`
- README.md expandido com seções de testes, deploy e variáveis de ambiente
- ARCHITECTURE.md expandido com fluxo de dados, módulos, SEO e performance
- Configuração do Vitest com setupFiles para jest-dom e exclusão de testes E2E

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
