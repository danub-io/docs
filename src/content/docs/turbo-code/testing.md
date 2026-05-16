---
title: "Testing"
---

The project uses **Vitest** v4 as the test runner with separate configurations for backend and frontend.

## Commands

```bash
npm test              # Backend tests only (once)
npm run test:watch    # Backend tests (watch mode)
npm run test:coverage # Backend tests with coverage (v8)
npm run test:web      # Frontend tests only (happy-dom)
npm run test:all      # All tests (backend + frontend)
```

## Test Structure (65 test files)

Tests live in `__tests__/` directories alongside source code:

```
src/                          (57 backend test files)
├── core/__tests__/           orchestrator, context-pruner, planParser, etc.
├── config/__tests__/         index
├── state/__tests__/          session, sessionStore
├── server/__tests__/         slash-commands, websocket-handler, websocket
├── services/__tests__/       semantic-cache
├── modules/
│   ├── __tests__/            logger
│   ├── agents/__tests__/     base, modes
│   ├── cache/__tests__/      chunk-cache, semantic-cache
│   ├── compression/__tests__/ compress
│   ├── interaction/__tests__/ flowManager, planDetection
│   ├── mcp/__tests__/        registry, stdio-client
│   ├── memory/__tests__/     store, dreamer, memory-tier
│   ├── providers/__tests__/  llm-client
│   ├── skills/__tests__/     adapter, registry, review-pr, shadcn
│   └── terminal/__tests__/   TerminalManager
├── tools/__tests__/          add_to_context, ask_user, bash, edit, fetch,
│                             find, grep, ls, pathUtils, project_inspector,
│                             read, registry, run_background, write, etc.
└── utils/__tests__/          symbolScanner, token-counter

web/src/                      (8 frontend test files)
├── hooks/__tests__/          useChatState, useSlashMenu, useWebSocket
├── components/__tests__/     AskUserModal
├── features/chat/__tests__/  ChatInput, MessageBubble
└── features/chat/hooks/__tests__/ useAutoScroll, useStreamHandler
```

## Configurations

### Backend (root `vitest.config.ts`)

- **Environment**: Node (default)
- **Coverage**: v8 provider, `text + lcov + html` reporters to `./coverage/backend`

### Frontend (`web/vitest.config.ts`)

- **Environment**: `happy-dom` (DOM APIs available)
- **Plugins**: `@vitejs/plugin-react` (JSX transform)
- **Coverage**: v8 provider, `text + lcov + html` reporters to `./coverage/frontend`

## CI/CD

GitHub Actions workflow in `.github/workflows/test.yml`:
- Runs on push/PR to `main`
- Matrix across Node.js 20 and 22
- Runs `npm run test:all`
- Builds the project
- Uploads coverage report as artifact

## Conventions

- Framework: Vitest (`describe`, `it`, `expect`, `vi`)
- Location: `src/<module>/__tests__/<name>.test.ts` (backend) or `web/src/...` (frontend)
- Backend imports use `.js` extension (e.g. `from "../store.js"`)
- Frontend uses `@testing-library/react` + `happy-dom` for component tests
- `renderHook` from `@testing-library/react` for hook tests
- WebSocket mocks use a custom `MockWebSocket` class
- DOM environment matchers (`.toBeDisabled()`) are **not** available — use `element.disabled` instead

## Coverage

Coverage is configured but thresholds are informational (no hard failures):
- Backend: 50% statements, 40% branches, 45% functions, 50% lines
- Frontend: 40% statements, 30% branches, 35% functions, 40% lines

Run `npm run test:coverage` or `npm run test:web:coverage` to generate reports.

## Legacy Tests

Files in `tests/` that run with `npx tsx`:
- `tests/env.test.ts` — validates environment (`.env`, gitignore, engines)
- `tests/frontend.test.ts` — verifies frontend build
