---
title: "Testing Strategy"
---



## Overview

The project uses two testing layers:

| Layer | Tool | What it tests | Location |
|--------|-----------|-------------|-------------|
| Unit | Vitest | Services, React components, utilities | `__tests__/` alongside the file |
| E2E | Playwright | Complete user flows, Astro pages | `tests/e2e/` |
| Community | Vitest + Playwright | Community module tests (auth, reviews, feed) | `src/modules/comunidade/__tests__/` and `tests/e2e/community-disabled.spec.ts` |

## Commands

```bash
# Unit
pnpm test              # Watch mode (development)
pnpm test:run          # Single run (CI)
pnpm test:coverage     # With coverage report

# E2E
pnpm test:e2e          # Run Playwright tests
```

## Coverage

Thresholds configured in `vitest.config.ts`:

| Metric | Threshold |
|---------|-----------|
| Lines | 80% |
| Functions | 75% |
| Branches | 70% |
| Statements | 80% |

Coverage covers files imported by the tests. Pure Astro components are covered by E2E tests.

## Test Patterns

### Services (mocked DB)

```typescript
vi.mock('@/core/lib/db', () => ({
  db: { execute: vi.fn() },
}));

// Success mock
(db.execute as any).mockResolvedValueOnce({ rows: [...] });
// DB error mock
(db.execute as any).mockRejectedValueOnce(new Error('DB error'));
// Parse error mock (malformed return)
(db.execute as any).mockResolvedValueOnce({ rows: [{ coluna_invalida: 'valor' }] });
```

**Required scenarios for every service:**
- **Parse error:** Malformed data returned from DB → service returns `[]`
- **DB error:** Connection/query failure → service returns `[]`
- **Empty results:** Successful query with no data → service returns `[]`
- **Feature flag:** Auth API tests use `vi.stubEnv('COMMUNITY_ENABLED', 'true')` before `vi.mock` to simulate the enabled module.

The community module has unit tests in `src/modules/comunidade/__tests__/` (auth, reviews, feed) and E2E tests in `tests/e2e/community-disabled.spec.ts` that verify behavior when disabled.

### React Components

```typescript
import { render, screen } from '@testing-library/react';

render(<Button variant="primary">Click</Button>);
expect(screen.getByRole('button')).toBeInTheDocument();
```

### Logger

```typescript
const spy = vi.spyOn(console, 'info').mockImplementation(() => {});
logger.info('test');
expect(spy).toHaveBeenCalledWith(expect.stringContaining('test'));
```

## Best Practices

1. **Tests close to code:** `__tests__/` in the same directory as the tested file
2. **DB mocking:** Never make real DB calls in tests
3. **Error coverage:** Test both success and failure/error cases
4. **React components:** Test rendering with different props/variants
5. **E2E:** Test critical flows (navigation, search, review)
