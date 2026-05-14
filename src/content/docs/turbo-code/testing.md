---
title: "Testing"
---

The project uses **Vitest** as the test runner.

## Commands

```bash
npm test            # Runs all tests once
npm run test:watch  # Watch mode (re-runs on change)
```

## Test Structure (15 test files)

Tests live in `__tests__/` directories alongside source code:

```
src/
├── core/__tests__/
│   ├── orchestrator.test.ts
│   └── planParser.test.ts
├── modules/
│   ├── agents/__tests__/
│   │   └── base.test.ts
│   ├── memory/__tests__/
│   │   ├── store.test.ts
│   │   └── dreamer.test.ts
│   ├── providers/__tests__/
│   │   ├── provider-config.test.ts
│   │   └── llm-client.test.ts
│   ├── skills/__tests__/
│   │   ├── adapter.test.ts
│   │   └── shadcn.test.ts
│   └── terminal/__tests__/
│       └── TerminalManager.test.ts
├── state/__tests__/
│   └── session.test.ts
├── config/__tests__/
│   └── index.test.ts
├── server/__tests__/
│   └── slash-commands.test.ts
└── tools/__tests__/
    ├── bash.test.ts
    ├── constants.test.ts
    └── edit.test.ts
```

## Conventions

- Framework: Vitest (`describe`, `it`, `expect`)
- Location: `src/<module>/__tests__/<name>.test.ts`
- Import with `.js` extension (e.g. `from "../store.js"`)
- Pure type tests are not required

## Legacy Tests

Files in `tests/` that run with `npx tsx`:
- `tests/env.test.ts` — validates environment (`.env`, gitignore, engines)
- `tests/frontend.test.ts` — verifies frontend build
