---
title: "Contributing — CTECH Frontend"
---

Thank you for contributing! This guide defines the standards and workflows to maintain code quality and consistency.

## Environment Setup

Prerequisites:
- Node.js >= 22.12.0
- pnpm (package manager)
- Turso account (database)

Steps:
```bash
git clone <repo-url>
cd ctech_fe
pnpm install
cp .env.example .dev.vars
# Configure the variables in .dev.vars (TURSO_DATABASE_URL, TURSO_AUTH_TOKEN, AUTH_SECRET)
pnpm dev
```

## Branch Strategy

- `production`: Main branch, always production-ready
- `develop`: Feature integration before merging into `production`
- `feat/<name>`: New features (e.g., `feat/laptop-filter`)
- `fix/<name>`: Bug fixes (e.g., `fix/navbar-mobile`)
- `refactor/<name>`: Refactoring (e.g., `refactor/db-service`)
- `chore/<name>`: Maintenance (e.g., `chore/update-deps`)

## Commit Pattern (Conventional Commits)

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation changes |
| `style` | Code formatting (no logic change) |
| `refactor` | Refactoring (no new features or fixes) |
| `test` | Adding/updating tests |
| `chore` | Maintenance (deps, scripts, etc.) |

Example:
```bash
git commit -m "feat(category): add label-based section grouping"
```

## Code Standards

- **TypeScript**: Strict mode enabled, avoid `any`
- **Linting**: ESLint configured (run `pnpm lint` before committing)
- **Formatting**: Prettier (run `pnpm format`)
- **UTF-8 without BOM**: Required for all files
- **Mobile First**: Every design starts with mobile
- **Astro Components**: Prefer static Astro components for content, use React Islands only for interactivity
- **Imports**: Use path aliases (`@core/*`, `@modules/*`) instead of deep relative paths
- **Images**: Use native `<img>` with `loading="lazy"` and `decoding="async"`

### Architecture

- `src/core/`: Global infrastructure (UI, layouts, lib, types)
- `src/modules/`: Isolated business domains (home, product, category, guide, auth)
- `src/pages/`: Astro routing layer (thin, only connects data to components)
- Services in `services/` access the Turso database directly
- Components in `components/` receive data via props

## Running Tests

### Unit Tests (Vitest)
```bash
pnpm test:run          # Single run
pnpm test:coverage     # With coverage report
```

Minimum coverage:
- Lines: 80%
- Functions: 75%
- Branches: 70%

### E2E Tests (Playwright)
```bash
pnpm test:e2e
pnpm test:e2e:dev      # With automatic dev server
```

## Pull Request Process

1. Create a branch from `develop`
2. Make your changes following the standards above
3. Run tests and lint locally:
   ```bash
   pnpm lint && pnpm exec tsc --noEmit && pnpm test:run
   ```
4. Open the PR targeting the `develop` branch
5. Fill out the PR template with a description of changes and change type
6. Wait for code review (minimum 1 approval)
7. Merge only after approval and CI passes

## Required Validation

When finishing changes, run:
1. `pnpm lint` — check ESLint
2. `pnpm exec tsc --noEmit` — type check
3. `pnpm test:run --coverage` — unit tests with coverage

## Code Review Checklist

- [ ] Follows Conventional Commits pattern
- [ ] Unit tests added or updated
- [ ] No lint errors (`pnpm lint`)
- [ ] TypeScript types correct (no unnecessary `any`)
- [ ] Functionality manually tested (if not covered by tests)
- [ ] Mobile First respected (responsive design)

## References

- [README](./README.md) — Project overview
- [ARCHITECTURE](./ARCHITECTURE.md) — Architecture and technical decisions
- [DATA_LAYER](./DATA_LAYER.md) — Data flow and services
