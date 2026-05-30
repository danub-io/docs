---
title: "Turbo Architecture"
---

# Turbo Architecture

## System Overview

Turbo is an agent ecosystem orchestrator. It provides a squad of specialized LLM agents that decompose, plan, execute, and diagram software engineering tasks — all without human intervention in the execution loop.

The user interacts **only with the Director agent** (via conversation or TUI). The Director thinks, refines scope, and when the user decides, either executes directly or delegates to the agent pipeline.

```
┌──────────────────────────────────────────────────────────────────┐
│                           User                                   │
│  "preciso refatorar o módulo de auth"                            │
└────────────────────────┬─────────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────────┐
│                     Director (single POC)                        │
│  AGENTS.md + modes/{critic,smart,manager,planner,executor,draw}  │
│                                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────┐  ┌────────┐  ┌─────────┐ │
│  │  critic  │  │  smart   │  │manager│  │planner │  │executor │ │
│  │ (modo    │  │ (modo    │  │decomp.│  │  plan  │  │ execute │ │
│  │ restrito)│  │ proativo)│  │       │  │       │  │         │ │
│  └──────────┘  └──────────┘  └───┬───┘  └───┬───┘  └────┬────┘ │
│                                  │          │           │       │
│  ┌──────────┐                    │          │           │       │
│  │  draw    │                    │          │           │       │
│  │diagrams  │                    └──────────┴───────────┘       │
│  └──────────┘                       agent pipeline              │
└──────────────────────────────────────────────────────────────────┘
```

## Autonomous Execution Philosophy

All agents operate under a single principle: **agents do not assist — they DO.**

- No human reads, reviews, or touches the output
- There is no handoff, no second chance, no human-in-the-loop
- Every recommendation and deliverable must be complete enough for autonomous execution
- The user scopes and decides; agents deliver

This philosophy is codified as **Section 0 (Autonomous Execution Mandate)** in every mode file.

## Canonical Sections

Every mode file follows a standardized section structure:

| Code | Section | Purpose |
|---|---|---|
| **C0** | **Autonomous Execution Mandate** | No human handoff, no partial work, no eyes/ears |
| **C1** | **Core Objective / Role** | What this agent does |
| **C2** | **Operating Principles** | How to think (ideation, sufficiency, context, constraints) |
| **C3** | **Strategy / Rules** | Serial/parallel, drawing rules, surgical changes |
| **C4** | **Workflow / Iteration** | SOP, quick iteration, fail fast |
| **C5** | **Output Format / Deliverables** | What to produce, where to save |
| **C6** | **Self-Verification** | Checklist before finishing (incl. completeness check) |
| **C7** | **Anti-Patterns** | Common mistakes to avoid |
| **C8** | **Diagram Rule** | Reference to draw.md (where applicable) |

## Agent Squad

### Director (AGENTS.md — always active)

The persistent brain. Single point of contact for the user. Routes to modes based on prefix (`/critic`, `/smart`).

| Capability | Mechanism |
|---|---|
| Conversation | Direct with user in pt-BR |
| Memory | `agents/director/memory/<topic>.md` + `index.yaml` |
| Delegation | manager, planner, executor, draw CLI commands |
| Direct execution | edit/write/bash tools (when user says "execute") |
| Git safety | `git ls-files` + `git diff` before every operation |

### Director Overlays (loaded on prefix)

| Mode | File | When to use |
|---|---|---|
| `/critic` | `modes/critic.md` | Sufficiency gate, surgical changes, push back on waste |
| `/smart` | `modes/smart.md` | Ideation, exploration, complete solutions, quick iteration |
| _(none)_ | Base AGENTS.md only | Default — no overlay |

### Agent Instructions (invoked via CLI or delegation)

| Agent | File | Responsibility |
|---|---|---|
| **Manager** | `modes/manager.md` | Decompose tasks into discipline-based work packages |
| **Planner** | `modes/planner.md` | Create structured execution plans with serial/parallel tasks |
| **Executor** | `modes/executor.md` | Execute plan tasks, commit, verify, rollback on failure |
| **Draw** | `modes/draw.md` | Create Unicode box-drawing diagrams via mermaid-ascii |

## CLI Entry Points

All installed in PATH via the `turbo` package:

| Command | Source | Purpose |
|---|---|---|
| `turbo` | `turbo.tui:main` | Full-screen TUI (4 modes: Director, Manager, Planner, Executor) |
| `manager` | `turbo.cli:manager_main` | Invokes the decomposition agent |
| `planner` | `turbo.cli:planner_main` | Invokes the planning agent |
| `executor` | `turbo.cli:executor_main` | Invokes the execution agent |
| `draw` | `turbo.cli:draw_main` | Invokes the diagrammer agent |

## Runtime Resources

Turbo reads system prompts from its own `agents/` directory:

| Resource | Location | Purpose |
|---|---|---|
| Base system prompt | `agents/director/AGENTS.md` | Always-active director instructions |
| Critic mode | `agents/director/modes/critic.md` | Critical/restrained overlay |
| Smart mode | `agents/director/modes/smart.md` | Intelligent/proactive overlay |
| Manager prompt | `agents/director/modes/manager.md` | Task decomposition |
| Planner prompt | `agents/director/modes/planner.md` | Execution planning |
| Executor prompt | `agents/director/modes/executor.md` | Task execution |
| Draw prompt | `agents/director/modes/draw.md` | Diagram generation |
| Work template | `agents/director/modes/work-template.md` | Work output template |
| Skills | `skills/*/SKILL.md` | Domain-specific knowledge |
| DB | `.ai/turbo.db` | SQLite (WAL mode) pipeline state |

## Data Flow

```
User message (with optional mode prefix)
  │
  ├── Director loads AGENTS.md
  │     └── If /critic or /smart prefix → loads corresponding mode overlay
  │
  ├── Director converses, refines scope
  │     └── Reads memory/ + index.yaml for context
  │
  └── User decides → "execute" or "delegate"
        │
        ├── Direct execution: Director uses tools (edit, write, bash)
        │
        └── Delegated execution:
              │
              ├── Manager: manager "prompt"
              │     └── Creates demands/<id>/demand.yaml + per-discipline files
              │
              ├── Planner: planner "<demand-id>"
              │     └── Creates plans/<id>/plan.yaml + tasks/*.md
              │
              ├── Executor: executor "<plan-id>"
              │     ├── Serial: sequential task execution
              │     └── Parallel: concurrent via threading
              │
              └── Pipeline state tracked in .ai/turbo.db
```

## KRAFTON-Inspired Improvements

The system prompts incorporate findings from KRAFTON AI's Terminus-KIRA research:

| Insight | Implementation |
|---|---|
| No human handoff | C0 in every mode: "agents do not assist — they DO" |
| Complete without intervention | C0: "submission is FINAL", no partial work |
| Self-evaluation of completeness | C6 in smart, critic, executor, planner, manager |
| Adaptive replanning | C4 in smart, C4 in executor, C3 in planner |
| No eyes/ears → use tools | C0 in smart, critic, executor |
| Scope clarification | C5 in manager, C7 in planner/smart |
| Avoid heavy dependencies | C4 + C6 in executor |
| Re-evaluation checkpoints | C3 + C6 in planner |

## Testing Architecture

- **Framework:** pytest with `asyncio_mode = "auto"`
- **Structure:** One test file per module, mirroring `src/turbo/`
- **Key test areas:**
  - CLI argument parsing and entry points
  - Plan generation and YAML reading
  - Task execution with mock pi subprocesses
  - Parallel concurrency verification
  - Process safety (PR_SET_PDEATHSIG)
