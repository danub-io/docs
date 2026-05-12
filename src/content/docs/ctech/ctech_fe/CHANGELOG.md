---
title: "Changelog"
---

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added
- **Typography System (RT-inspired):** 14 `type-*` utility classes in
  `src/core/styles/global.css`
- **Font tokens:** `--font-body` and `--font-display` in Tailwind `@theme inline`
- **Slug cache (1h):** `productService.getAllSlugs()`
- **Category-with-guides cache (30min):** `guideService.getCategoriesWithGuides()`
- **Aggregate function `getFullProduct`:** Parallelizes 3 queries (product + reviews + affiliates)
- **Recommendation Guide Hub:** Category pages as editorial hubs with guide cards
- **`/guide/[slug]` route:** Individual guide pages with Schema.org `ItemList`
- **`Guides` and `Guide_Products` tables:** Turso entities for the guide system
- **`guideService.ts`:** Full service with 4 query methods
- **Components:** `GuideCard.astro`, `GuideGroup.astro`, `GuideHeader.astro`
- **User Reviews:** Section on product page + `/product/[slug]/user-reviews` page
- **Components:** `ProductUserReviews.astro`, `PressReviewCard.astro`
- **`review_type` in Reviews table:** Separates press reviews (`critic`) and user reviews (`user`)
- **Product Module:** Replaces the `reviews` module — route `/product/[slug]`
- **ProductSpecs.astro:** Technical specifications display
- **Modularization:** `home` module with Layout, Navbar, Footer, Hero, Categories, Trending
- **CategoryIcon.astro:** SVG icons per category (removes external font dependency)
- **CONTRIBUTING.md:** Contribution guide with commits, branches, and PRs
- **DATA_LAYER.md:** Data flow documentation
- **docs/:** Architecture, deployment, and troubleshooting sub-documents
- Unit tests for UI, logger, ProductSchema, services
- **Removed:** `FilterBar.astro`, `TierSection.astro`, `CategoryHeader.astro`, `EmptyState.astro`, `CategoryPanel.astro`
- Automatic changelog update script via CI and in-progress changes
- Font pairing and typographic refinements across components
- UI/UX design standardization with tokens, new Shadcn components, and refactoring
- 1x1 badge with centered text and smaller title on hero
- Responsive product page layout — smaller image with text beside it on desktop, adaptive offer card columns
- Refactored hero carousel with responsive desktop/mobile layout and rounded-card pattern
- LoginDialog accepts `children` prop (custom trigger) and `redirectUrl` (post-login redirect)

### Changed
- **`--spacing-section-gap`:** 48px → **32px**
- **`--spacing-margin-edge`:** Removed. Layout uses `px-4` (`1rem`)
- **HeroCarousel:** Autoplay plugin memoization with `useMemo`
- **NavDrawer:** `nativeButton={false}` and explicit state control
- **ProductVerdict.astro:** Now accepts `userScore` and `userReviewCount` (dynamic score)
- AppleCardsCarousel replaced by HeroHorizontal with flexible ProductCard
- NotaBadge reformatted to square layout with centered content

### Optimized
- **`/product/[slug]` page:** `getFullProduct` reduces 3 sequential queries to 1 parallelized

### Fixed
- **CSP was blocking React hydration (`client:load`):** Added `'unsafe-inline'` to `script-src`
- **Ligature Leak:** Material Symbols → Inline SVGs
- **Design Tokens:** `--radius-full` → `9999px`
- **DB connectivity:** Fallback to `process.env` in `db.ts`
- **LP Layout:** Line break on "View All" link and scrollbars
- **Tests:** Incorrect function name, outdated SQL assertions
- Fixes redirect URL expectation in WriteReviewButton.test
- Fixes test expectations to match current code
- Fixes JSX types, ref nullable, event.target, and excludes `__tests__` from tsc
- Removes unused `fill` prop in apple-cards-carousel
- Fixes Base UI v1.4.1 types (sideOffset, delay, ItemIndicator) and SubMenuItem
- Disables no-unsafe-function-type in test files
- Removes unused catch variable in authService
- Allows any and unused vars in test files (eslint)
- Fixes build_section regex to avoid false positives in changelog
- Hamburger opens with native Drawer, hero with client:load, categories with border
- Standardizes Shadcn colors/fonts, fixes hero and hamburger menu
- Fixes 5 design issues and migrates visual style to Mira
- Fixes deploy job checkout (fetch-depth:0 + fetch-tags:true)

### Documentation
- **`docs/architecture/components.md`**: Rewritten with current components
- **`docs/architecture/islands.md`**: Actual hydration state
- **`docs/architecture/search.md`**: New full-text search documentation
- **`docs/security/security.md`**: CSP, headers, SQL injection
- **`docs/development/setup-local.md`**: Setup with Turso
- **`ARCHITECTURE.md`**: Deduplication cleanup
- **`README.md`**: Expanded docs section
- **`ADRs/`**: 4 Architecture Decision Records

### Improved
- Test coverage: lines 60% → 80%, functions 60% → 75%, branches 50% → 70%

---

## [1.0.8] - 2026-05-08

### Added
- Automatic changelog update script via CI and in-progress changes
- Font pairing and typographic refinements across components
- UI/UX design standardization with tokens, new Shadcn components, and refactoring
- 1x1 badge with centered text and smaller title on hero
- Responsive product page layout — smaller image with text beside it on desktop, adaptive offer card columns
- Refactored hero carousel with responsive desktop/mobile layout and rounded-card pattern
- LoginDialog accepts `children` prop (custom trigger) and `redirectUrl` (post-login redirect)

### Fixed
- Fixes redirect URL expectation in WriteReviewButton.test
- Fixes test expectations to match current code
- Fixes JSX types, ref nullable, event.target, and excludes `__tests__` from tsc
- Removes unused `fill` prop in apple-cards-carousel
- Fixes Base UI v1.4.1 types (sideOffset, delay, ItemIndicator) and SubMenuItem
- Disables no-unsafe-function-type in test files
- Removes unused catch variable in authService
- Allows any and unused vars in test files (eslint)
- Fixes build_section regex to avoid false positives in changelog
- Hamburger opens with native Drawer, hero with client:load, categories with border
- Standardizes Shadcn colors/fonts, fixes hero and hamburger menu
- Fixes 5 design issues and migrates visual style to Mira
- Fixes deploy job checkout (fetch-depth:0 + fetch-tags:true)

### Changed
- AppleCardsCarousel replaced by HeroHorizontal with flexible ProductCard
- NotaBadge reformatted to square layout with centered content

---

## [1.0.6] - 2026-05-07

### Added
- Peek effect on categories + soft border muted/50
- Hero with glassmorphism, border beam on badge, linear progress indicators
- Unified card with shadcn, soft score badge, shine border for score > 9, skeleton loading

### Fixed
- Hero in 2 blocks with separate glass, badge in original position, smaller indicators

### Changed
- Moves hero text below carousel, larger categories, removes extra padding
- Migrates review creation form to modal with Dialog and Slider

---

## [1.0.5] - 2026-05-06

### Fixed
- Unvalidated redirect vulnerability (security)
- Replace `<Image />` with native `<img>` to fix broken images in production

### Changed
- Refactors footer and product component improvements

---

## [1.0.4] - 2026-05-05

### Fixed
- Replace `<Image />` with native `<img>` to fix broken images in production
- Adds `process.env` fallback for Cloudflare Workers runtime secrets

---

## [1.0.3] - 2026-05-05

### Fixed
- Configures 5 secrets on Worker, fixes sitemap warning, updates actions to v5

### Documentation
- Adds secret verification and redeploy notes to deployment documentation

---

## [1.0.2] - 2026-05-05

### Fixed
- Adds explicit `account_id` in `wrangler.jsonc` for CI

---

## [1.0.1] - 2026-05-05

### Fixed
- Uses `pnpm run deploy` in CI to avoid conflict with pnpm built-in command

---

## [1.0.0] - 2026-05-05

### Added
- Migration to Cloudflare Pages with full authentication
- Routes without prefix and new label system
- Full-text search system
- Interactive product comparison and UI component library
- UI migration to ShadCN design system
- Redesign and rebranding to TECHCRITIC
- Mobile-first layout inspired by Rotten Tomatoes

### Fixed
- Removes obsolete mode from cloudflare adapter (Options v13)
- Outdated lockfile, env fallback in cryptoService
- 19 TypeScript errors for CI with `tsc --noEmit`
- Deprecated base URL in tsconfig
- Various configuration and initial setup errors

### Changed
- Refactors comparison page, migrates search/category, adds ScoreBadge component
- Parallelizes queries and adds frontend cache to reduce row reads
- Updates theme to MD3 light and refactors UI components
- Redesigns homepage for editorial data-driven layout
- Removes unused components

---

## [0.1.0] - 2026-04-15

### Added
- Initial project setup with Astro 6 + React 19
- Tailwind CSS v4 with custom design tokens
- shadcn/ui components (Badge, Button, Card, Progress)
- Layouts: Navbar, Footer, BottomNav
- Pages: Home, Laptops, Compare, Community, Reviews
- Turso database integration (libsql)
- Services: category, laptop, review, compare, community, home
- Data validation with Zod
- Security middleware (CSP, HSTS, X-Frame-Options)
- CI/CD with GitHub Actions
- Initial unit tests with Vitest (60% coverage)
- E2E tests with Playwright
- Initial documentation (README.md, ARCHITECTURE.md)
