---
title: "MBA Lite"
---



Landing page do curso **MBA Lite — A Série Gestão para Alta Performance**, construída com **Astro 6**, **React 19**, **Tailwind CSS v4** e **shadcn/ui**.

## 🚀 Tecnologias

- **Framework:** Astro 6
- **UI:** React 19 + shadcn/ui (base-nova, Base UI)
- **Estilização:** Tailwind CSS v4
- **Fontes:** Geist Variable (Google Fonts)
- **Build:** SSG puro

## 📄 Estrutura

```
src/
├── components/       # Componentes da landing page
│   ├── Header.astro
│   ├── Hero.astro
│   ├── Features.astro
│   ├── LeadCapture.astro
│   ├── AuthorBio.astro
│   ├── Footer.astro
│   └── ui/           # Componentes shadcn/ui
├── layouts/          # Layout base
├── pages/            # index.astro
├── lib/              # Utilitários
└── styles/           # Tailwind CSS v4 (@theme)
```

## 🛠️ Comandos

```bash
pnpm install          # Instalar dependências
pnpm dev              # Servidor local
pnpm build            # Build de produção
pnpm preview          # Preview do build
```
