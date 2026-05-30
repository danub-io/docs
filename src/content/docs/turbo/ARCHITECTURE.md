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
| `manager` | `turbo.cli:manager_main` | Decomposes tasks into discipline-based demands (flags: -q, -a, -m) |
| `planner` | `turbo.cli:planner_main` | Generates structured plans from descriptions or demands (flags: -q, -a, --plan-id-prefix, --demand-id) |
| `executor` | `turbo.cli:executor_main` | Executes plan tasks sequentially or in parallel (flags: -a, --plan-dir, --max-retries) |
| `draw` | `turbo.cli:draw_main` | Generates Unicode box-drawing diagrams from descriptions |

## Python Modules (src/turbo/, 20 modules, ~7000 lines)

| Module | Lines | Responsibility |
|--------|-------|----------------|
| `tui.py` | 2440 | Full-screen Rich terminal UI with DirectorRPC, paste detection, config/help overlays |
| `cli.py` | 2174 | CLI entry points, demand pipeline orchestration, model config resolution |
| `db.py` | 476 | SQLite database with WAL mode, 8 tables (board, demands, audit_events, etc.) |
| `executor.py` | 850 | Task execution with pi subprocess, retry logic, .md file polling |
| `planner.py` | 278 | Plan generation via pi agent, plan_id format, retry support |
| `display.py` | 406 | Rich terminal output: ExecutionProgressTable, demand/plan summaries |
| `orchestrator.py` | 130 | SerialParallelRunner — shared orchestration pattern |
| `models.py` | 72 | Dataclasses: Plan, Task, TaskMode, TaskStatus, Demand, ParentDemand, Discipline |
| `config.py` | 55 | pi binary lookup, plans dir, turbo root resolution |
| `plan_reader.py` | 73 | YAML + markdown plan deserialization, checklist parsing |
| `demand_reader.py` | 121 | YAML demand deserialization, parent/child demand reading |
| `config_screen.py` | 464 | Provider/model/thinking configuration overlay |
| `help_screen.py` | 79 | Help keyboard shortcut overlay |
| `draw.py` | 148 | ASCII diagram generation via pi agent + mermaid-ascii |
| `monitor.py` | 64 | Plan execution status polling |
| `update_check.py` | 111 | pi coding agent update notifications |
| `visible_executor.py` | 231 | Terminal-window-per-task execution (xterm/konsole/gnome-terminal) |
| `proc.py` | 11 | Process safety: PR_SET_PDEATHSIG |
| `cache.ts` + `cacheStats.ts` | 164 | Cache usage tracking for director commands |

## Runtime Resources

Turbo reads system prompts from its own `agents/` and `skills/` directories:

| Resource | Location | Purpose |
|---|---|---|
| Base director prompt | `agents/director/AGENTS.md` | Always-active director instructions |
| Director memory (10 topics) | `agents/director/memory/*.md` | Architecture, decisions, postmortems, patterns, changelog, meta, etc. |
| Director memory index | `agents/director/index.yaml` | Token-optimized 1-line summaries (~0.5K tokens) |
| Critic mode | `agents/director/modes/critic.md` | Critical/restrained overlay |
| Smart mode | `agents/director/modes/smart.md` | Intelligent/proactive overlay |
| Work template | `agents/director/modes/work-template.md` | Work output template |
| Manager prompt | `agents/manager/prompt.md` | Task decomposition (creates demand files) |
| Planner prompt | `agents/planner/prompt.md` | Execution planning (creates plan.yaml + task files) |
| Executor prompt | `agents/executor/prompt.md` | Task execution with git safety and rollback |
| Draw prompt | `agents/draw/prompt.md` | Diagram generation via mermaid-ascii |
| Skills (22 total) | `skills/*/SKILL.md` | Domain-specific knowledge for pi agent |
| DB | `.ai/turbo.db` | SQLite (WAL mode) — 8 tables |

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
              │     └── Creates demands/<parent_id>/parent_demand.yaml
              │         └── + demands/<parent_id>/<discipline>/demand.yaml (per discipline)
              │
              ├── Planner: planner "description" (or with --demand-id)
              │     └── Creates plans/<plan_id>/plan.yaml + tasks/<plan_id>-NN.md
              │
              ├── Pipeline: _execute_demand_pipeline()
              │     ├── Groups consecutive same-mode disciplines → groups
              │     ├── Each group runs sequentially (ALL must complete)
              │     ├── Within group: serial disciplines run one-by-one
              │     │                 parallel disciplines run concurrently (threading)
              │     ├── Planner spawned per discipline (headless or xterm)
              │     └── Executor spawned per discipline (SerialParallelRunner)
              │
              └── Pipeline state tracked in .ai/turbo.db (8 tables)
```

## Pipeline Execution Model

Turbo executes through a **3-level batch hierarchy** for maximum throughput:

```
DEMAND
│
├── GROUP 1 (serial)
│ └── security ──► plan ──► T1(s) ──► T2(p) ──► T3(s)
│
├── GROUP 2 (parallel)
│ ├── ui-ux ──► plan ──► T1(p) ──► T2(s)
│ └── perf ──► plan ──► T1(p) ──► T2(p)
│
└── GROUP 3 (serial)
  └── docs ──► plan ──► T1(s) ──► T2(s)
```

**Level 1 — Groups (Disciplines):** Consecutive same-mode disciplines form a group. Groups execute in order; a group starts only when ALL previous groups complete.

**Level 2 — Tasks (SerialParallelRunner):** Within each discipline, serial tasks execute immediately; parallel tasks batch into Python-threaded dispatch.

**Level 3 — Steps:** The pi agent executes steps sequentially from each `task-XX.md`.

### Agent Swarms

Turbo scales to hundreds of agents running simultaneously:
- Each parallel group launches multiple planner + executor pairs concurrently
- Parallel tasks dispatch across Python threads, each spawning a pi subprocess
- A single `manager` command can orchestrate 50+ agents across 4+ parallel disciplines
- The SQLite state machine tracks every agent's status in real-time

### Concept-to-Code Mapping

| Concept | File Format | Location | Created By |
|---------|-------------|----------|------------|
| Work | Natural language | User input | User |
| ParentDemand | `parent_demand.yaml` | `demands/<id>/` | Manager |
| Demand | `demand.yaml` | `demands/<id>/<discipline>/` | Manager |
| Plan | `plan.yaml` | `plans/<id>/` | Planner |
| Task | `<plan_id>-NN.md` | `plans/<id>/tasks/` | Planner |
| Step | Markdown checklist | `task-XX.md` (inline) | Planner |

### Database Schema (.ai/turbo.db, SQLite WAL mode)

| Table | Purpose |
|-------|---------|
| `board` | Demands, plans, execution tracking per discipline |
| `demands` | Demand metadata (status, description, timestamps) |
| `prompts` | Versioned agent prompts |
| `model_config` | Per-role provider/model/thinking/retry config |
| `secrets` | Encrypted API keys |
| `sessions` | Conversation history with token/cost tracking |
| `decisions` | Architectural decisions log |
| `audit_events` | Every state transition with timestamp |

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
- **Coverage:** 80% minimum (`--cov-fail-under=80`) with HTML report
- **Structure:** One test file per module, mirroring `src/turbo/`
- **Test count:** 155+ tests
- **Key test areas:**
  - CLI argument parsing and entry points (`test_cli.py`)
  - Plan generation and YAML reading (`test_planner.py`)
  - Task execution with mock pi subprocesses (`test_executor.py`)
  - Parallel concurrency verification (`test_orchestrator.py`)
  - Process safety (PR_SET_PDEATHSIG) (`test_proc.py`)
  - SQLite database operations (`test_db.py`)
  - Pipeline integration (full demand→plan→execute flow) (`tests/pipeline/`)
  - TUI rendering and DirectorRPC (`test_tui.py`)
  - Visible executor terminal spawning (`test_visible_executor.py`)
