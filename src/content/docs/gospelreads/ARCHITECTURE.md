---
title: "Architecture — GospelReads"
---



## Overview

Static blog (SSG) focused on performance, SEO, and typography. Content is managed via Astro Content Collections, and the entire site is pre-rendered at build time.

```
Markdown (MD) → Content Collections → Astro Pages → Static HTML → GitHub Pages
```

## Project Structure

```
src/
├── assets/           # Images and static assets
├── components/       # React components (UI)
├── content/          # Content Collections
│   ├── posts/        # MD articles with frontmatter
│   ├── authors/      # Author profiles
│   └── pages/        # Static pages
├── layouts/          # Base site layout
├── lib/              # Utilities and helpers
├── pages/            # Astro routes (index, posts/[slug])
└── styles/           # Global styles + Tailwind v4
```

## Content Collections

### Posts

Schema with `title`, `description`, `date`, `authors`, `tags`, `image`, `draft`. Uses the `glob` loader to read `.md` files from `src/content/posts/`.

### Authors

Profiles with `name`, `image`, `description`, and social media links.

### Pages

Static pages with `title` and `description`.

## Performance

- **100/100 Lighthouse** — Pure SSG with no JavaScript on initial load
- **Optimized images** — `aspect-video`, `object-cover`, grayscale filter via CSS
- **Refined typography** — serif fonts for headings, sans-serif for body
- **Aggressive caching** — Firebase configured with `max-age=31536000` for assets

## Stack

- Astro 6 (SSG)
- React 19 (islands of interactivity)
- Tailwind CSS v4 + @tailwindcss/typography + @tailwindcss/vite
- @base-ui/react (accessible UI primitives)
- lucide-react (icons)
- react-markdown (MD rendering in React)
- date-fns (pt-BR date formatting)
- sharp (image processing)
- GitHub Pages (hosting with global CDN)
