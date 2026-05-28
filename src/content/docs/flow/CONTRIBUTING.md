---
title: "Contributing to Flow"
---

# Contributing to Flow

## Development Setup

```bash
git clone <repo-url>
cd flow
pnpm install
pnpm dev       # http://localhost:5173
```

## Code Standards

### Stack (immutable)

| Layer       | Technology                                             |
|-------------|--------------------------------------------------------|
| Framework   | React 19                                               |
| Build       | Vite 6                                                 |
| Language    | TypeScript strict                                      |
| Package mgr | pnpm (never npm or yarn)                               |
| CSS         | Tailwind 4                                             |
| Flow        | React Flow (@xyflow/react)                             |
| DB          | In-memory + YAML disk backup                           |
| State mgmt  | React hooks (useState, useCallback, useRef, useEffect) |

### Architecture Principles

1. **Independent modules** — each module (Nav, Sidebar, Canvas, Modals, db, lib) is self-contained. Changes in one do not break others.
2. **Compartmentalization** — a module never imports directly from inside another module. Communication via props/callbacks in App.
3. **No circular dependencies** — imports follow a single direction: `lib/` → `db/` → components → `App.tsx`.
4. **Data flows down** — App manages global state. Child components receive props and notify via callbacks.
5. **Components are "dumb"** — no global state, no side effects that impact other modules.

### Coding Rules

- `import type` for type-only imports
- Explicit param and return types on functions
- Meaningful names (avoid `data`, `temp`, `result`)
- Early returns over nested ifs
- `const`/`let` over `var`
- `async/await` over raw promises

### DO NOT

- No global state (Redux, Zustand, Context for global state)
- No importing from inside another component
- No `any` or unnecessary type assertions
- No mixing responsibilities — App coordinates, components render
- No unnecessary dependencies

### Edit Pattern

- Text fields: local state + commit onBlur (like Figma, Notion, VS Code)
- Icon changes: commit immediately (single-choice action)
- Auto-save: 1.5s debounce (UPDATE, not INSERT)
- Snapshots: explicit save or 2s idle after node property change

## Post-Code-Change Checklist

After any large edit block (>20 lines):

- [ ] Run `pnpm build` (build passes?)
- [ ] Run `pnpm dev` and open browser
- [ ] Check browser console for errors (no red)
- [ ] Confirm app rendered (no blank screen)
- [ ] Click each node type (agent, blackboard) on canvas
- [ ] Verify undo/redo/save/load work
- [ ] Verify all functions/variables referenced in JSX below the edit still exist

## ⚠️ Hard Rules

1. **Never edit files in `/home/dan/Documentos/big-brain/turbo/`** — doing so violates the separation between Flow (frontend) and Turbo (orchestrator).
2. **Never edit system prompts in `agents/` without understanding the impact** on the pi agent's behavior during planner/executor/diagrammer execution.
3. **Always create a postmortem** in `knowledge/postmortem-<slug>.md` when resolving a significant bug.
