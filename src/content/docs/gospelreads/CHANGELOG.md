---
title: "Changelog"
---



## [Unreleased]

### Fixed

- Package name in `package.json` (`proud-phase` → `gospelreads`)
- Conflicting package managers: removed `package-lock.json` and `.yarnrc` (standardized on pnpm)
- Removed Next.js artifact (`next-env.d.ts`)
- `@types/react` and `@types/react-dom` moved to `devDependencies`
- `.gitignore` now covers `.next/` and `next-env.d.ts`
- Broken test: created `content.ts` (the module the test imported did not exist)
- `docs/` added with documentation index

## [0.1.0] - 2026-04-15

### Added

- Blog with Content Collections (posts, authors, pages)
- Responsive layout with refined typography
- MDX support for rich content
- Homepage with hero post + sidebar
- Individual post pages with SEO
- Author profiles with social media links
- Firebase Hosting with optimized caching
- 100/100 Lighthouse performance
- Tailwind CSS v4 with @tailwindcss/typography
- React components (Separator, UI)
