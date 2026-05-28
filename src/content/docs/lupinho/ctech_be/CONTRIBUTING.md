---
title: "Contributing — CTECH Backend"
---

Thank you for contributing to the project! This guide defines the standards and workflows for maintaining code quality and consistency.

## Setting Up the Development Environment

Prerequisites:
- Node.js >= 22.12.0
- pnpm (package manager)
- Turso account (database)
- API keys for AI services (optional, for local development)

Steps:
```bash
git clone <repo-url>
cd ctech_be
pnpm install
cp .env.example .env.local
# Configure the variables in .env.local
pnpm dev
```

## Branch Strategy

- `production`: Main branch, always production-ready
- `develop`: Feature integration
- `feature/*`: New features
- `fix/*`: Bug fixes
- `refactor/*`: Code refactoring
- `chore/*`: Maintenance tasks

## Commit Convention (Conventional Commits)

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation changes |
| `style` | Code formatting (no logic change) |
| `refactor` | Refactoring (no new features or fixes) |
| `test` | Adding or updating tests |
| `chore` | Maintenance (deps, scripts, etc.) |

## Code Standards

- **TypeScript**: Strict mode enabled, avoid `any`
- **Linting**: ESLint configured (run `pnpm lint` before committing)
- **Formatting**: 2-space indentation, UTF-8 without BOM
- **Architecture**:
  - Server Actions in `src/app/actions/` for business logic
  - Repository Pattern in `src/lib/repositories/` for data access
  - UI components in `src/components/ui/` (Shadcn pattern)
- **Logger**: Use `@/lib/logger` instead of `console.log`

## Running Tests

### Unit Tests (Vitest)
```bash
pnpm test:run          # Single run
pnpm test:ui           # Visual interface
```

Minimum coverage: lines 60%, functions 60%, branches 50%

### E2E Tests (Playwright)
```bash
pnpm exec playwright test
```

## Pull Request Process

1. Create a branch from `develop`
2. Make your changes following the above standards
3. Run tests and lint locally:
   ```bash
   pnpm lint && pnpm test:run
   ```
4. Open the PR to the `develop` branch
5. Wait for code review (minimum 1 approval)
6. Merge only after approval and CI passes

## Code Review Checklist

- [ ] Follows Conventional Commits style
- [ ] Tests added or updated
- [ ] No lint errors (`pnpm lint`)
- [ ] Correct TypeScript types (no unnecessary `any`)
- [ ] Feature manually tested (if not covered by tests)

## References

- [README](./README.md) — Project overview
- [ARCHITECTURE](./ARCHITECTURE.md) — Architecture and technical decisions
- [API](./API.md) — API reference
