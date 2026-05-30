---
title: "Flow Architecture"
---

# Flow Architecture

> **Deprecated — Source directory removed:** The Flow project directory (`/home/dan/Documentos/flow/`) no longer exists on disk. The React frontend was abandoned before connecting to real data. The system prompts (now in `turbo/agents/`), AI skills (now in `turbo/skills/` — 22 skills), and agent configurations have been fully absorbed into the [Turbo](/docs/turbo/) repository. The Turbo TUI (`turbo-tui`) replaced the visual pipeline builder. See [Turbo Architecture](/docs/turbo/architecture/) for current architecture.

## Historical Overview

Flow served two distinct roles during its development:

### 1. Visual Pipeline Builder (React Application — Abandoned)

A React Flow-based node-based editor that was replaced by the Turbo TUI before reaching production. Supported two node types:

- **Agent Nodes** — Represent AI agents with configurable:
  - Label, description, prompt
  - Agent type: Planner, Executor, or Custom
  - Icon with distinct color
  - Provider/model/thinking configuration
  - Inputs and outputs (handles for edge connections)

- **Blackboard Nodes** — Represent shared memory between agents:
  - Append-only key-value store
  - Access control via readers/writers lists
  - Content display and editing
  - Edge connections to agents

### 2. Runtime Resources (Absorbed into Turbo)

Contained the system prompts, skills, and configuration consumed by the [Turbo](/docs/turbo/) orchestrator. These resources now live directly in the Turbo repository:

```
agents/
├── planner/prompt.md             # Planner AI system instructions (178 lines)
├── executor/prompt.md            # Executor AI system instructions (32 lines)
└── diagrammer/prompt.md          # Diagrammer AI system instructions (279 lines)

skills/
├── python/SKILL.md               # Python development skill
├── react/SKILL.md                # React development skill
├── next/SKILL.md                 # Next.js development skill
├── astro/SKILL.md                # Astro development skill
├── tailwind/SKILL.md             # Tailwind CSS skill
├── turso/SKILL.md                # Turso/Database skill
├── shadcn/SKILL.md               # shadcn/ui skill
├── zod/SKILL.md                  # Zod validation skill
├── css/SKILL.md                  # CSS skill
├── git/SKILL.md                  # Git skill
├── github/SKILL.md               # GitHub skill
├── html/SKILL.md                 # HTML skill
├── javascript/SKILL.md           # JavaScript skill
├── latex/SKILL.md                 # LaTeX typesetting skill
├── pandoc/SKILL.md               # Pandoc document conversion skill
├── pydantic/SKILL.md             # Pydantic validation skill
├── typer/SKILL.md                 # Typer CLI skill
├── languagetool/SKILL.md         # LanguageTool grammar checking skill
├── react-flow/SKILL.md           # React Flow skill
├── cloudflare-workers/SKILL.md   # Cloudflare Workers skill
├── ascii/SKILL.md                # ASCII diagram skill
└── _template/SKILL.md            # Template for new skills

public/
└── model-provider-reference.md   # Provider/model selection configuration
```

## Component Architecture

### State Management

Flow uses React hooks exclusively — no global state libraries (Redux, Zustand, Context for global state).

- **App.tsx** — Manages global state (nodes, edges, prompt, selectedNode)
- **Components** — Receive data via props, notify changes via callbacks
- **Local state** — Used for text fields (commit on blur)

### Key Patterns

1. **Independent modules** — Nav, Sidebar, Canvas, Modals, db, lib never import from each other directly
2. **Compartmentalization** — No component imports from inside another component module
3. **No circular dependencies** — Imports follow a single direction: `lib/` → `db/` → components → `App.tsx`
4. **Data flows down** — App owns state, children receive props
5. **Text edit pattern** — Local state until blur, then commit

### Persistence Architecture

```
User edits node
       │
       ▼
App.setState (nodes/edges)
       │
       ├── auto-save (1.5s debounce) → UPDATE in database
       │
       └── idle snapshot (2s debounce after last edit) → INSERT version
              │
              ├── saveToLocalStorage() → localStorage (cache)
              │
              └── syncToDisk() → saves/<timestamp>_<name>.yaml (source of truth)
                     │
                     └── (only on explicit save, not on auto-save)
```

## Postmortems

Postmortems for Turbo (including historical Flow issues) are at [`/home/dan/Documentos/turbo/knowledge/`](https://github.com/danub-io/turbo/tree/production/knowledge).

Historical Flow postmortems (archived):

| Date | Issue |
|------|-------|
| 2026-05-23 | `cn()` import removed during modularization — blank screen |
| 2026-05-23 | Textarea not editing — `localRef` not updating controlled input |
| 2026-05-23/24 | Missing `allAgentIcons` import + tree-shaking — blank screen on node click; lost functions in refactor; `data.description` undefined in saved flows |

## Development Commands

```bash
pnpm dev          # Dev server on localhost:5173
pnpm build        # Production build in dist/
pnpm preview      # Preview production build
```

## Removed Modules (2026-05-24)

The following simulated modules were removed because they only contained mock implementations that never called the real pi agent:

- `src/lib/pi-agent.ts` — Had `simulatePiAgent()` but never used the real agent
- `src/lib/planner.ts` — Depended on simulated pi-agent
- `src/lib/executor.ts` — Depended on simulated pi-agent
- `src/lib/agents.ts` — Pipeline runner, not imported anywhere
- `PipelineStatePanel.tsx` — Not imported anywhere

The `handleRun` in `App.tsx` was simplified to write the prompt to the blackboard and log that the backend is not connected. The TUI (`turbo-tui`) replaced this entire visual pipeline approach — no backend integration was ever completed.
