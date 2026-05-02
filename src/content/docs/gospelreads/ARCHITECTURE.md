---
title: "Arquitetura do GospelReads"
---



## Visão Geral

Blog estático (SSG) com foco em performance, SEO e tipografia. O conteúdo é gerenciado via Content Collections do Astro e todo o site é pré-renderizado no build.

```
Markdown (MD) → Content Collections → Páginas Astro → HTML estático → Firebase Hosting
```

## Estrutura do Projeto

```
src/
├── assets/           # Imagens e assets estáticos
├── components/       # Componentes React (UI)
├── content/          # Content Collections
│   ├── posts/        # Artigos em MD com frontmatter
│   ├── authors/      # Perfis de autores
│   └── pages/        # Páginas estáticas
├── layouts/          # Layout base do site
├── lib/              # Utilitários e helpers
├── pages/            # Rotas Astro (index, posts/[slug])
└── styles/           # Estilos globais + Tailwind v4
```

## Content Collections

### Posts

Schema com `title`, `description`, `date`, `authors`, `tags`, `image`, `draft`. Usa loader `glob` para ler arquivos `.md` de `src/content/posts/`.

### Authors

Perfis com `name`, `image`, `description` e links de redes sociais.

### Pages

Páginas estáticas com `title` e `description`.

## Performance

- **100/100 Lighthouse** — SSG puro sem JS no carregamento inicial
- **Imagens otimizadas** — `aspect-video`, `object-cover`, grayscale filter via CSS
- **Tipografia refinada** — fontes serifadas para títulos, sans-serif para corpo
- **Cache agressivo** — Firebase configurado com `max-age=31536000` para assets

## Stack

- Astro 6 (SSG)
- React 19 (ilhas de interatividade)
- Tailwind CSS v4 + @tailwindcss/typography
- date-fns (formatação de datas pt-BR)
- Firebase Hosting (CDN global)
