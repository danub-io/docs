---
title: 'Turbo — AI Agent Orchestrator'
---

# Turbo — AI Agent Orchestrator

**Turbo** is a terminal-based AI agent orchestration platform. It takes complex software engineering tasks, decomposes them into structured plans, executes them via specialized agents in optimized parallel batches, and shows real-time progress — all from your terminal.

```text
═══════════════════════════════════════════════════════════════════
   You: "Refactor auth to JWT + add rate limiting"

   Turbo:
   ├── 1. Decomposes into 3 disciplines (security, arch, docs)
   ├── 2. Generates plans with serial/parallel optimization
   ├── 3. Executes 12 tasks via pi agents in 2 parallel groups
   └── 4. Shows live pipeline progress in the TUI sidebar

   Done. 3 disciplines ─ 12 tasks ─ 47s. ✓
═══════════════════════════════════════════════════════════════════
```

## 🚀 One-Click Install

```bash
curl -fsSL https://raw.githubusercontent.com/danub-io/turbo/main/scripts/install.sh | bash
```

This single command installs **everything**:

| What                        | Details                                                                 |
| --------------------------- | ----------------------------------------------------------------------- |
| ✅ **pi coding agent**      | `@earendil-works/pi-coding-agent` (npm global)                          |
| ✅ **Turbo CLI**            | `turbo` · `manager` · `planner` · `executor` · `draw`                   |
| ✅ **22 agent skills**      | React · Astro · Python · Next.js · Tailwind · Git · and more            |
| ✅ **6 specialized agents** | director · manager · planner · executor · draw — each with full prompts |
| ✅ **6 director modes**     | critic · smart · planner · manager · executor · draw                    |
| ✅ **Shell integration**    | PATH setup, alias for `turbo` command                                   |

<details>
<summary><b>📋 Manual installation</b> (click to expand)</summary>

**Prerequisites:**

| Tool    | Min Version | Install                                                                 |
| ------- | ----------- | ----------------------------------------------------------------------- |
| Python  | ≥ 3.12      | `pyenv install 3.12` or [python.org](https://www.python.org/downloads/) |
| Node.js | ≥ 22        | `nvm install 22` or [nodejs.org](https://nodejs.org/)                   |
| npm     | ≥ 10        | ships with Node.js                                                      |

**Step by step:**

```bash
# 1. Install pi agent
npm install -g @earendil-works/pi-coding-agent

# 2. Clone Turbo
git clone --depth 1 https://github.com/danub-io/turbo.git ~/.turbo
cd ~/.turbo

# 3. Install Turbo CLI
python3 -m venv .venv
source .venv/bin/activate
pip install -e .

# 4. Verify
turbo --help
```

</details>

## 🎮 Quick Start

```bash
# Launch the full-screen TUI
turbo

# Or run a task directly from the command line:
manager "Add JWT authentication with refresh tokens to the API"
```

### TUI Keyboard Shortcuts

| Key           | Action                                               |
| ------------- | ---------------------------------------------------- |
| `Tab`         | Cycle modes: Director → Manager → Planner → Executor |
| `Enter`       | Send message / run command                           |
| `Alt+Enter`   | Insert newline in input                              |
| `Ctrl+H`      | Open help screen                                     |
| `Ctrl+C`      | Open config (provider/model per agent)               |
| `Ctrl+Y`      | Copy chat log (also saved to `tmp/` as fallback)     |
| `Ctrl+Q`      | Quit                                                 |
| `↑`/`↓`       | Scroll chat log                                      |
| `PgUp`/`PgDn` | Scroll chat log by half page                         |
| `Esc`         | Clear input                                          |

## ✨ Features

```text
════════════════════════════════════════════════════════════════════════
                         FEATURES OVERVIEW
════════════════════════════════════════════════════════════════════════
   🧠  Multi-Agent Pipeline    Director → Manager → Planner → Executor
   🤖  Agent Swarms           Hundreds of agents running in parallel
   🖥️  Terminal UI (TUI)       Full-screen chat + real-time sidebar
   ⚡  Parallel Execution      Auto-optimizes serial vs parallel
   🧩  22 Agent Skills         Astro · React · Python · Git · CSS
   🔌  Pi Integration          Seamless connection with pi agent
   🧠  Persistent Memory       Director remembers context & decisions
   📊  Pipeline Tracking       SQLite state machine with audit events
   🎨  Draw Mode               Architecture diagrams from description
   📦  Zero Config             Single command — everything works
════════════════════════════════════════════════════════════════════════
```

## 🏗️ Architecture

```
═══════════════════════════════════════════════════════════════
                     ┌──────────────┐
                     │    User      │
                     └──────┬───────┘
                            │
                            ▼
                     ┌──────────────┐
                     │  turbo TUI   │
                     │  ┌────────┐  │  ┌──────────────┐
                     │  │  Chat  │  │  │   Pipeline   │
                     │  │ Input  │  │  │   Sidebar    │
                     │  └────────┘  │  └──────────────┘
                     └──────┬───────┘
════════════════════════════╪═════════════════════════════════
                            ▼
                     ┌──────────────┐
                     │   director   │ ◀── sole contact point
                     └──────┬───────┘
                    ┌───────┼───────────┐
                    ▼       ▼           ▼
             ┌──────────┐ ┌──────┐ ┌──────────┐
             │  Manager │ │ draw │ │  critic  │
             │  Planner │ │ smart│ │ executor │
             │ Executor │ │  ... │ │  ...     │
             └─────┬────┘ └──────┘ └──────────┘
                   │         (modes)
                   ▼
             ┌──────────────┐
             │   pi agent   │
             ├──────────────┤
             │ 22 Skills    │
             │ 4 Extensions │
             └──────────────┘
═══════════════════════════════════════════════════════════════
  Pipeline:  demands/ ──► plans/<id>/ ──► tasks/ ──► DB
  State:     SQLite (.ai/turbo.db)
  Tables:    board · demands · audit_events
═══════════════════════════════════════════════════════════════
```

## 🧠 Agent Squad

| Agent        | Role                                                     | Invocation                       |
| ------------ | -------------------------------------------------------- | -------------------------------- |
| **director** | Board of Directors — persistent memory, decisions        | Chat via TUI (Director mode)     |
| **manager**  | Task Decomposition — breaks large tasks into disciplines | `manager "refactor auth to JWT"` |
| **planner**  | Plan Generation — creates structured execution plans     | `planner "add login page"`       |
| **executor** | Task Execution — runs plan steps via pi agent            | `executor <plan_id>`             |
| **draw**     | Architecture Diagrams — Unicode from descriptions        | `draw "API request flow"`        |

### Director Chat Modes

Prefix a message in Director mode to switch behavior:

| Prefix    | Mode                  | Effect                                      |
| --------- | --------------------- | ------------------------------------------- |
| `/critic` | Critical/Restrained   | Strict sufficiency gate — only what's asked |
| `/smart`  | Intelligent/Proactive | Spots opportunities, suggests with context  |
| _(none)_  | Default               | Balanced responses from base system prompt  |

## 📖 Core Concepts

```text
 ═════════════════════════════════════════════════════════════════════
                         CONCEPT HIERARCHY
 ═════════════════════════════════════════════════════════════════════

    WORK ──► DEMAND ──► DISCIPLINE ──► PLAN ──► TASK ──► STEP

    ──────────────────────────────────────────────────────────────
     WORK       High-level user request. Ex: "Refactor auth JWT"
    ──────────────────────────────────────────────────────────────
     DEMAND     Decomposed work package. ParentDemand groups
                disciplines and defines serial/parallel order
    ──────────────────────────────────────────────────────────────
     DISCIPLINE Domain area (security, ui-ux, perf, docs ...).
                Each has mode, description, and acceptance crit.
    ──────────────────────────────────────────────────────────────
     PLAN       plan.yaml + task files.
                SerialParallelRunner orchestrates task execution
    ──────────────────────────────────────────────────────────────
     TASK       Unit of work with mode (serial/parallel).
                Each task has task-XX.md with execution steps.
    ──────────────────────────────────────────────────────────────
     STEP       Atomic action within a task. Steps execute
                sequentially via pi agent. Ex: Modify file X.
    ──────────────────────────────────────────────────────────────

 ═════════════════════════════════════════════════════════════════════
```

### Work

A **Work** is any high-level request or goal from the user. It is the input to the system. Work enters the system via the **Manager**, which decomposes it into structured, non-overlapping **disciplines**.

### Demand

A **Demand** is a decomposed work package. There are two levels:

- **ParentDemand** — Groups multiple child demands (disciplines) and defines the overall execution order (serial/parallel groups)
- **Child Demand** — A single discipline's work package, ready for a planner to convert into a plan

Each demand is a YAML file stored in `demands/<parent_id>/`. The parent demand at `parent_demand.yaml` lists all disciplines; each child is at `<discipline>/demand.yaml`.

### Discipline

A **Discipline** is a domain area or category of work. Each discipline has:

- A **mode** (`serial` or `parallel`) — determines whether it runs sequentially or concurrently with other disciplines
- A **description** — what needs to be done
- **Acceptance criteria** — how to verify completion
- Optional **dependencies** — other disciplines it depends on

Standard disciplines include: `quality`, `performance`, `documentation`, `security`, `testing`, `architecture`, `ui-ux`, `data`, `devops`.

Consecutive disciplines with the same mode form a **group**. Groups execute one at a time in order — a group only starts when ALL previous groups complete.

### Task

A **Task** is a unit of work within a plan. Created by the **Planner** from a discipline demand. Each task has:

- A **mode** (`serial` or `parallel`) — dictates execution ordering
- A **task file** — a markdown file at `plans/<plan_id>/tasks/task-XX.md` with execution steps
- A **status** — `pending` → `running` → `completed` / `error`

Tasks are orchestrated by the **SerialParallelRunner**: serial tasks execute immediately (blocking), parallel tasks accumulate into a batch and dispatch via Python threads.

### Step

A **Step** is a single, atomic action within a task. Steps are defined in `task-XX.md` files with exact-search-and-replace blocks. Steps execute **sequentially** within a task — each step must complete before the next begins.

### Concept-to-Code Mapping

| Concept      | File Format          | Location                     | Created By |
| ------------ | -------------------- | ---------------------------- | ---------- |
| Work         | Natural language     | User input                   | User       |
| ParentDemand | `parent_demand.yaml` | `demands/<id>/`              | Manager    |
| Demand       | `demand.yaml`        | `demands/<id>/<discipline>/` | Manager    |
| Plan         | `plan.yaml`          | `plans/<id>/`                | Planner    |
| Task         | `task-XX.md`         | `plans/<id>/tasks/`          | Planner    |
| Step         | Markdown checklist   | `task-XX.md` (inline)        | Planner    |

## ⚡ Pipeline Execution Model

Turbo executes through a **3-level batch hierarchy** for maximum throughput:

```text
═══════════════════════════════════════════════════════════════
                    PIPELINE EXECUTION FLOW
═══════════════════════════════════════════════════════════════

   DEMAND
     │
     ├── GROUP 1 (serial)
     │   └── security ──► plan ──► T1(s) ──► T2(p) ──► T3(s)
     │
     ├── GROUP 2 (parallel)
     │   ├── ui-ux ──► plan ──► T1(p) ──► T2(s)
     │   └── perf  ──► plan ──► T1(p) ──► T2(p)
     │
     └── GROUP 3 (serial)
         └── docs ──► plan ──► T1(s) ──► T2(s)

═══════════════════════════════════════════════════════════════
```

**Level 1 — Groups (Disciplines):** Consecutive disciplines with the same `mode` form a group. Groups execute one at a time in order. A group only starts when ALL previous groups complete.

**Level 2 — Tasks (SerialParallelRunner):** Within each discipline, serial tasks execute immediately; parallel tasks batch into a Python-threaded dispatch.

**Level 3 — Steps:** The pi agent executes steps sequentially from each `task-XX.md`.

### 🤖 Agent Swarms

Turbo scales to **hundreds of agents running simultaneously** through its discipline swarm architecture:

- Each `parallel` group launches **multiple planner + executor pairs** concurrently — each pair is an independent pi agent process
- Within a parallel discipline, `parallel` tasks dispatch across **Python threads**, each spawning its own pi subprocess
- A single `manager` command can orchestrate **50+ agents** across 4+ parallel disciplines, each with 10+ parallel tasks
- The SQLite state machine tracks every agent's status in real-time — no polling, no race conditions
- The TUI sidebar shows the full swarm hierarchy: groups → disciplines → tasks, with live status badges

**Example:** A full-stack refactor with 4 parallel disciplines (ui-ux, security, performance, docs) × 8 parallel tasks each = **32 concurrent pi agents** across 4 planner/executor pairs.

## 📁 Project Structure

```
turbo/
├── AGENTS.md                    # Agent ecosystem docs
├── README.md                    # Project documentation
├── scripts/
│   ├── install.sh               # One-click installer
│   └── render-diagram.mjs       # Mermaid → Unicode diagrams
│
├── agents/                      # Agent prompts & memory
│   ├── director/                # Board of Directors
│   │   ├── AGENTS.md            #   Base system prompt
│   │   ├── memory/              #   Topic files (10 topics)
│   │   ├── index.yaml           #   Memory index
│   │   └── modes/               #   Behavior modes
│   │       ├── critic.md        #     Restrained mode
│   │       ├── smart.md         #     Proactive mode
│   │       ├── draw.md          #     Diagram mode
│   │       ├── planner.md       #     Plan mode
│   │       ├── manager.md       #     Decomposition mode
│   │       └── executor.md      #     Execution mode
│   ├── manager/                 # Task decomposition
│   ├── planner/                 # Plan generation
│   ├── executor/                # Task execution
│   └── draw/                    # Architecture diagrams
│
├── src/turbo/                   # Python orchestrator
│   ├── tui.py                   # Full-screen TUI
│   ├── cli.py                   # CLI entry points
│   ├── db.py                    # SQLite database
│   ├── orchestrator.py          # Serial/parallel runner
│   ├── planner.py               # Calls pi for planning
│   ├── executor.py              # Calls pi for execution
│   ├── draw.py                  # Architecture diagrams
│   ├── config_screen.py         # Provider/model config UI
│   ├── help_screen.py           # Help overlay
│   └── ...                      # 18 modules, ~7000 lines
│
├── skills/                      # 22 agent skills
│   ├── react/                   # React 19
│   ├── python/                  # Python 3
│   ├── next/                    # Next.js 16
│   ├── astro/                   # Astro 6
│   ├── git/                     # Git workflows
│   ├── github/                  # GitHub platform
│   └── ...                      # 16 more
│
├── extensions/                  # Pi agent extensions
│   ├── skill-usage.ts           # Skill usage tracking
│   ├── diagnostics-sync.ts      # Auto-TS error detection
│   ├── pi-formatter/            # Multi-tool formatter
│   └── pi-web-access/           # Web search & fetch
│
├── knowledge/                   # Postmortems & decisions
├── tests/                       # 155+ Python tests
├── plans/                       # Generated plans (gitignored)
└── demands/                     # Demand YAMLs (gitignored)
```

## 🛠️ CLI Reference

| Command              | Description                               |
| -------------------- | ----------------------------------------- |
| `turbo`              | Launch the full-screen terminal TUI       |
| `manager "task"`     | Full pipeline: decompose → plan → execute |
| `planner "task"`     | Generate a structured plan only           |
| `executor <plan_id>` | Execute an existing plan                  |
| `draw "description"` | Generate a Unicode architecture diagram   |

## 🔌 Extensions

| Extension               | What It Does                                                                |
| ----------------------- | --------------------------------------------------------------------------- |
| **skill-usage.ts**      | Tracks which skills load most often — query via `/skill-stats`              |
| **diagnostics-sync.ts** | Auto-runs `tsc --noEmit` after `.ts`/`.tsx` edits, catches errors instantly |
| **pi-formatter**        | Multi-tool formatter: Prettier · ESLint · Ruff · Biome · shfmt · more       |
| **pi-web-access**       | Web search, fetch, and content extraction for research within pi            |

## 🧩 Skills (22 total)

| Category               | Skills                                                                                 |
| ---------------------- | -------------------------------------------------------------------------------------- |
| **Web Development**    | Astro 6 · Next.js 16 · React 19 · HTML · CSS · JavaScript · Tailwind CSS · shadcn/ui   |
| **Backend & API**      | Python 3 · Typer · Pydantic v2 · Cloudflare Workers · Turso · Zod 4                    |
| **DevOps & Tools**     | Git · GitHub · Pandoc                                                                  |
| **UI & Visualization** | React Flow v12 · Rich (Python TUI) · LaTeX · LanguageTool · Diagrams (Mermaid/Unicode) |

Each skill is a `SKILL.md` file in `skills/<name>/` with complete prompts for the pi agent.

## 🧪 Testing

```bash
# Run all tests
pytest

# With coverage report
pytest --cov=src/turbo --cov-report=term-missing

# Pipeline integration tests
pytest tests/pipeline/test_integration.py -v
```

**155+ tests** covering: pipeline integration (full demand→plan→execute flow), SQLite database operations, CLI argument parsing, SerialParallelRunner orchestration, TUI rendering.

## Environment Variables

| Variable          | Description                   | Default                      |
| ----------------- | ----------------------------- | ---------------------------- |
| `TURBO_DIR`       | Turbo installation directory  | Auto-detected                |
| `TURBO_PLANS_DIR` | Directory for generated plans | `<turbo>/plans/`             |
| `PI_BIN`          | Path to the pi binary         | Auto-detected via `which pi` |

## Configuration

### Provider & Model Selection

Turbo reads provider, model, and thinking budget from `model-provider-data.json` in the turbo root directory. You can use a **stronger model for planning** (e.g., deepseek-v4-pro with high thinking) and a **cheaper model for execution** (e.g., deepseek-v4-flash with thinking off).

## 🧭 Operating Principles

Turbo and its agents follow two core principles that guide every decision:

### ⚖️ Principle of Sufficiency

> Before suggesting or executing any change, ask: **will this be significantly better, or just different?**

- **Significantly better** = measurably faster, fewer errors, unblocks something real
- **Different** = same outcome, different format or style
- **Default answer:** "This is fine, move on."

### 🤔 Think Before Assuming

> If you are about to implement something, stop and ask: **did I confirm my understanding with the Director?**

1. State your understanding of the request in your own words
2. Present any alternative interpretations
3. Ask for confirmation before coding

This prevents wasted work from unstated assumptions or ambiguous requests.

## 📚 Documentation

- [`AGENTS.md`](https://github.com/danub-io/turbo/blob/main/AGENTS.md) — Agent squad docs
- [`CONTRIBUTING.md`](https://github.com/danub-io/turbo/blob/main/CONTRIBUTING.md) — Contribution guide
- [`knowledge/`](https://github.com/danub-io/turbo/tree/main/knowledge) — Postmortems and architecture decisions
- [`skills/README.md`](https://github.com/danub-io/turbo/tree/main/skills) — Skill index

---

## 📄 License

MIT © 2025–2026 Danubio. See [LICENSE](https://github.com/danub-io/turbo/blob/main/LICENSE) for details.
