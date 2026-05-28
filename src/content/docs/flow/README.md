---
title: "Flow — Visual Pipeline Builder (Deprecated)"
---

# Flow

> **Deprecated:** This project was absorbed into [Turbo](/docs/turbo/). The React Flow frontend was abandoned and replaced by the Turbo TUI (`turbo-tui`). System prompts and skills now live at `/home/dan/Documentos/turbo/agents/` and `/home/dan/Documentos/turbo/skills/`.

Visual agent pipeline builder — a node-based editor that was absorbed into the Turbo orchestrator before reaching production.

Built with React Flow and a VS Code-inspired dark theme.

## Stack

| Layer       | Technology                          |
|-------------|-------------------------------------|
| Framework   | React 19                            |
| Build       | Vite 6                              |
| Language    | TypeScript (strict)                 |
| Package mgr | pnpm                                |
| CSS         | Tailwind 4                          |
| Flow        | React Flow (@xyflow/react)          |
| DB          | In-memory + YAML disk backup        |

## Development

```bash
pnpm install
pnpm dev       # http://localhost:5173
pnpm build     # output in dist/
```

## Architecture

### Module layout

```
src/
  components/
    Nav.tsx              — Top bar (save, undo/redo, flow name, menu)
    Sidebar.tsx          — Right panel (node properties, prompt, output)
    BlackboardEditor.tsx — Editor for blackboard connections
    HamburgerMenu.tsx    — Hamburger menu (New, Save, Load, Add Node)
    Canvas/
      AgentNode.tsx      — Agent node rendering
      BlackboardNode.tsx — Blackboard node rendering
      index.tsx          — React Flow wrapper
    Modals/
      AgentModal.tsx     — Agent node configuration (Planner/Executor/Custom)
      BlackboardModal.tsx— Blackboard configuration (readers, writers, content)
      LoadDialog.tsx     — Load / delete flows
  db/
    database.ts          — JavaScript array persistence
    index.ts             — Re-exports
    sync-to-disk.ts      — YAML mirror for saves/
  lib/
    constants.ts         — Theme tokens, icon map, styles, default flow
    utils.ts             — cn() + truncate() helpers
    pipeline-state.ts    — Pipeline state types
    blackboard.ts        — Append-only shared memory with access control
    provider-models.ts   — Provider/model/thinking options
  App.tsx                — Global state orchestration, auto-save, layout
  main.tsx
  index.css
saves/                   — YAML disk backups (source of truth, git-ignored)
```

### Data flow

```
App (global state) ──props──→ Components
     ↑                            │
     │                            │ callbacks
     └────────────────────────────┘
```

Components never import from other components. Communication is exclusively via props and callbacks from App.

## Features

- 🧩 Node-based agent pipeline editor
- 🎨 29+ agent icon types with distinct colors
- 📜 Version history with undo/redo (up to 50 versions per flow)
- 💾 Auto-save with in-memory + YAML disk persistence
- 🌙 VS Code Dark theme
- 🔌 Custom skills and agent types (Planner, Executor, Custom)

## Persistence Model

| Priority | Storage | Role |
|----------|---------|------|
| 1 | In-memory (`database.ts`) | Primary source during session |
| 2 | YAML disk (`saves/`) | **Source of truth** — survives localStorage wipe |
| 3 | `localStorage` | Fast read cache — auto-populated |

### Vite Endpoints

- `POST /__save` — body: `{ yaml: string }` → writes `saves/<timestamp>_<name>.yaml`
- `GET /__load` — lists all `.yaml` in `saves/`
- `GET /__load?file=<filename>` — returns parsed YAML as JSON

## Postmortems

See the [knowledge/](https://github.com/danub-io/turbo/tree/production/knowledge) directory in the Flow repo for postmortems on bugs and architectural decisions.
