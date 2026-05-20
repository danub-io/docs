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

## Test Structure (91 test files)

Tests live in `__tests__/` directories alongside source code:

```
src/                          (83 backend test files)
├── core/__tests__/           orchestrator, context-pruner, planParser,
│                             contextBudget, auto-commit, ecosystem-integration,
│                             early-termination, decision-oracle, etc.
├── config/__tests__/         index
├── state/__tests__/          session, sessionStore
├── server/__tests__/         slash-commands, websocket-handler, websocket
├── services/__tests__/       semantic-cache
├── modules/
│   ├── __tests__/            logger
│   ├── agents/__tests__/     base, modes
│   ├── analytics/__tests__/  background-optimizer, self-diagnosis, debt-tracker
│   ├── cache/__tests__/      chunk-cache, semantic-cache
│   ├── compression/__tests__/ compress
│   ├── interaction/__tests__/ flowManager, planDetection
│   ├── mcp/__tests__/        registry, stdio-client
│   ├── memory/__tests__/     store, dreamer, memory-tier
│   ├── providers/__tests__/  llm-client
│   ├── skills/__tests__/     adapter, registry, review-pr, shadcn
│   └── terminal/__tests__/   TerminalManager
├── tools/__tests__/          add_to_context, ask_user, bash, edit, fetch,
│                             find, git, grep, ls, pathUtils, pr, project_inspector,
│                             read, registry, review, rollback, run_background,
│                             write, etc.
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

## Ultra-Premium Test Standard

### Test Quality Ladder

Every test must target at least Level 2 (Happy Path). Level 1 (Smoke) is **prohibited** for new code.

| Nível | Name | Characteristics | Obrigatório para |
|-------|------|-----------------|------------------|
| 1 | Smoke | "Não explodiu" — `toBeTruthy()` or `toBeDefined()` | ❌ **Proibido** |
| 2 | Happy Path | Caminho feliz apenas | ✅ Mínimo aceitável |
| 3 | Edge Cases | Null, empty, boundary, concorrência | ✅ Tools |
| 4 | Error States | Erro de rede, permissão, timeout | ✅ Tools |
| 5 | Property-Based | Invariantes testadas via `fast-check` | ✅ edit, git, bash |
| 6 | Mutation-Tested | Stryker score >70% | ✅ edit, git, rollback |
| 7 | Integration Real | Módulos reais interagindo | ✅ Cenários críticos |

### Template (mínimo para código novo)

```typescript
// Nível 2+ obrigatório
describe("ToolX.y()", () => {
  it("faz o que promete (happy path)", () => {
    // Arrange
    // Act
    // Assert — SEMPRE testar valor real, não "existe"
  });

  it("lida com entrada vazia (edge case)", () => { ... });
  it("lida com erro de permissão (error state)", () => { ... });
});
```

### Regras de Ouro

1. **Zero asserções genéricas** — `toBeTruthy()`, `toBeDefined()`, `not.toThrow()` sem contexto são proibidos em PRs novos
2. **Três A's sempre** — Arrange, Act, Assert (separados por linha em branco)
3. **Teste o comportamento, não a implementação** — não espiar métodos privados, não testar que `vi.fn()` foi chamado se o resultado final é mensurável
4. **Um conceito por `it()`** — se você escreve "and" no nome do teste, divida em dois
5. **Nome descritivo** — `it("retorna 404 quando usuário não existe")` não `it("testa erro")`

### Property-Based Testing

Usar `fast-check` (`^4.8.0`) para testar invariantes com entradas aleatórias:

```typescript
import fc from "fast-check";

it("exact replacement changes file content correctly", async () => {
  await fc.assert(
    fc.asyncProperty(
      fc.string({ minLength: 1, maxLength: 30 }).filter(s => /^[a-zA-Z][a-zA-Z0-9 ]*$/.test(s)),
      fc.string({ minLength: 1, maxLength: 30 }).filter(s => /^[a-zA-Z][a-zA-Z0-9 ]*$/.test(s)),
      async (oldStr, newStr) => {
        const base = `hello ${oldStr} world`;
        writeFileSync(filePath, base, "utf-8");
        const result = await EditTool.execute({ ... }, {} as any);
        if (result.success) {
          expect(readFileSync(filePath, "utf-8")).toBe(base.replace(oldStr, newStr));
        }
      },
    ),
    { numRuns: 100 },
  );
});
```

### Mutation Testing

Stryker mede a qualidade **real** dos testes. Arquivo: `stryker.config.json` na raiz.

```bash
npx stryker run --concurrency 2
```

Módulos monitorados: `edit.ts`, `git.ts`, `rollback.ts`, `bash.ts`, `grep.ts`

Thresholds: `high: 90`, `low: 80`, `break: 70`

### Pre-commit Quality Gates

O hook `.githooks/pre-commit` verifica:
1. TypeScript (`tsc --noEmit`)
2. Testes alterados (`vitest run --changed`)
3. Unused params (`grep`)
4. File size (<500 linhas)
5. TODO/FIXME sem issue
6. **Zero asserções genéricas** em arquivos staged

### CI Quality Gates

`.github/workflows/ci.yml`:
- Type check (`tsc --noEmit`)
- Tests (`vitest run --pool=forks`) — se falhar, CI falha
- Coverage com thresholds (`lines: 60, functions: 50, branches: 40, statements: 60`)
- Mutation score nos módulos configurados

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

### Coverage Goals (Informational)

| Area | Statement Coverage | Target |
|------|-------------------|--------|
| Global | ~58% | 65% |
| Server | ~43% | 60% |
| Core | ~38% | 50% |
| State | ~74% | 85% |

## Legacy Tests

Files in `tests/` that run with `npx tsx`:
- `tests/env.test.ts` — validates environment (`.env`, gitignore, engines)
- `tests/frontend.test.ts` — verifies frontend build
