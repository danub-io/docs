---
title: "Changelog"
---



## [Unreleased]

### Corrigido

- Nome do pacote no `package.json` (`proud-phase` → `gospelreads`)
- Gerenciadores conflitantes: removidos `package-lock.json` e `.yarnrc` (padronizado para pnpm)
- Artefato Next.js (`next-env.d.ts`) removido
- `@types/react` e `@types/react-dom` movidos para `devDependencies`
- `.gitignore` agora cobre `.next/` e `next-env.d.ts`
- Teste quebrado: `content.ts` criado (módulo que o teste importava não existia)
- `docs/` adicionado com índice de documentação

## [0.1.0] - 2026-04-15

### Adicionado

- Blog com Content Collections (posts, authors, pages)
- Layout responsivo com tipografia refinada
- Suporte a MDX para conteúdo rico
- Página inicial com hero post + sidebar
- Páginas individuais de posts com SEO
- Perfis de autores com redes sociais
- Firebase Hosting com cache otimizado
- 100/100 Lighthouse performance
- Tailwind CSS v4 com @tailwindcss/typography
- Componentes React (Separator, UI)
