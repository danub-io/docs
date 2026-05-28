---
title: "Turbo Architecture"
---

# Turbo Architecture

## System Overview

Turbo is a Python CLI orchestrator that uses the [pi coding agent](https://github.com/earendil-works/pi-coding-agent) to plan and execute software engineering tasks. It reads system prompts and AI skills from the [Flow](/docs/flow/) project at runtime.

```
┌──────────────────────────────────────────────────────┐
│                      User                            │
│   planner "refactor auth to use JWT"                 │
└──────────────────┬───────────────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────────────┐
│                     CLI Entry Points                 │
│  planner_main()   executor_main()   diagrammer_main()│
└──────────────────┬───────────────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────────────┐
│                    Planner                           │
│  Reads system prompt from:                           │
│    flow/agents/planner/prompt.md                     │
│  Calls pi agent with prompt + config                 │
│  Outputs plan.yaml + tasks/*.md                      │
└──────────────────┬───────────────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────────────┐
│                    Executor                          │
│  Reads system prompt from:                           │
│    flow/agents/executor/prompt.md                    │
│  Spawns per-task pi subprocesses                     │
│  Serial mode: sequential execution                   │
│  Parallel mode: concurrent via threading             │
│  Visible mode: opens terminal windows                │
└──────────────────────────────────────────────────────┘
```

## Runtime Resources

Turbo reads system prompts and AI skills from its own `agents/` and `skills/` directories:

| Resource | Location | Purpose |
|---|---|---|
| Planner system prompt | `agents/planner/prompt.md` | Instructions for the planning AI model |
| Executor system prompt | `agents/executor/prompt.md` | Instructions for the execution AI model |
| Diagrammer system prompt | `agents/diagrammer/prompt.md` | Instructions for diagram generation |
| Skills | `skills/*/SKILL.md` | Domain-specific knowledge (Python, React, etc.) |
| Model config | `public/model-provider-reference.md` | Provider/model/thinking selection UI |

The prompts and skills are located at `agents/` and `skills/` relative to the project root, or configured via the `TURBO_DIR` environment variable.

## Module Architecture

### CLI Layer (`cli.py`)

Three independent entry points, each parsing their own arguments:

- **`planner_main()`** — Generates a plan and executes it automatically. Supports `-a` for visible terminal windows.
- **`executor_main()`** — Executes an existing plan by plan ID. Supports `-a` for visible terminal windows.
- **`diagrammer_main()`** — Sends a prompt to the diagrammer agent and saves the output as a Markdown file.

All three call `check_pi_update()` on startup to notify about new pi agent versions.

### Planner Module (`planner.py`)

1. Generates a unique `plan_id` from the current timestamp
2. Creates `~/.ai/plans/<plan_id>/` with a `tasks/` subdirectory
3. Reads the planner system prompt from the Flow project
4. Calls `pi` with `--mode json --no-context-files` and provider/model flags
5. Parses the pi agent's JSON output for token usage and cost
6. Validates that `plan.yaml` was created
7. Returns the plan directory and usage statistics

### Executor Module (`executor.py`)

1. Reads the executor system prompt from the Flow project
2. Iterates through tasks in order, respecting their `mode` (serial/parallel)
3. For each task:
   - Creates a Python wrapper script with the task metadata
   - Spawns `python3 <wrapper>.py <meta>.json` as a subprocess
   - The wrapper reads the pi agent, streams output, and writes a done file
   - The main process polls for the done file (up to 15 minutes timeout)
4. Serial tasks: process one at a time, waiting for completion
5. Parallel tasks: process all concurrently using threading
6. A Markdown poller thread monitors task file changes for live display updates

### Process Safety (`proc.py`)

- Linux: Uses `PR_SET_PDEATHSIG` via `ctypes` to ensure child processes receive `SIGTERM` when the parent dies
- macOS/Windows: Degrades gracefully (default SIGHUP propagation applies)
- Visible executor tasks are exempt (they run in their own terminal windows)

### Visible Executor (`visible_executor.py`)

- Monkey-patches `executor._start_task` to open each task in a separate terminal window
- Supports: `x-terminal-emulator`, `xterm`, `konsole`, `gnome-terminal` (Linux); `Terminal`, `iTerm2`, `Warp` (macOS); `wt.exe`, `cmd` (Windows)
- Uses the `TERMINAL` environment variable for custom terminal emulators

### Model Config Resolution (`cli.py`)

Two-stage resolution:

1. **JSON config** (`model-provider-data.json`) — machine-readable, checked first
2. **Markdown config** (`model-provider-reference.md`) — human-editable checkboxes, fallback

Both files live in the Flow project's `public/` directory.

## Data Flow

```
planner "prompt"
  │
  ├── planner.py: plan(prompt, provider, model, thinking)
  │     ├── reads system prompt from flow/agents/planner/prompt.md
  │     ├── calls pi agent with --mode json
  │     └── writes plan.yaml + tasks/*.md
  │
  └── execute_plan(plan_dir, exec_cfg)
        │
        └── executor.py: execute_all(plan, provider, model, thinking, visible)
              ├── serial: _exec_serial_tasks → _start_task → pi subprocess
              └── parallel: _exec_parallel_tasks → _start_task → pi subprocesses
```

## Testing Architecture

- **Framework:** pytest with `asyncio_mode = "auto"`
- **Structure:** One test file per module, mirroring `src/turbo/`
- **Key test areas:**
  - CLI argument parsing and entry points
  - Plan generation and YAML reading (including backward-compatible Portuguese keys)
  - Task execution with mock pi subprocesses
  - Parallel concurrency verification via timestamp recording
  - Process safety (PR_SET_PDEATHSIG)
  - Update check caching and notifications
