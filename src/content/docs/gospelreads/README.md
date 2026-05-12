---
title: "GospelReads — The Intellectual Archive"
---



A blog for theological content and Christian reflections, built with **Astro 6**, **React 19**, and **Tailwind CSS v4**. Hosted on **Firebase Hosting**.

## 🚀 Technologies

- **Framework:** Astro 6+ (SSG)
- **Interactive UI:** React 19
- **Styling:** Tailwind CSS v4 + Typography
- **Content:** Content Collections (MDX)
- **Hosting:** Firebase Hosting
- **Fonts:** Google Fonts via CSS

## 📄 Content Structure

```
src/content/
├── posts/          # Blog articles (MD)
├── authors/        # Author profiles
└── pages/          # Static pages
```

## 🛠️ Commands

```bash
pnpm install          # Install dependencies
pnpm dev              # Local server (localhost:4321)
pnpm build            # Production build
pnpm preview          # Preview the build
```

## ☁️ Deploy (Firebase)

```bash
pnpm build
firebase deploy
```

The build outputs files to `dist/`, which are served by Firebase Hosting with aggressive caching (1 year for static assets).
