---
title: "Turbo — AI Agent Orchestrator"
---

# Turbo — AI Agent Orchestrator

**Turbo** turns a single high-level prompt into a complete, ordered plan — then executes each task autonomously via the [pi coding agent](https://github.com/earendil-works/pi-coding-agent), with full progress visibility and cost tracking.

## Features

| Capability | Description |
|---|---|
| **AI-Powered Planning** | Decomposes any prompt into ordered, isolated tasks with clear dependencies |
| **Dual Execution** | Serial for dependent steps, parallel for independent work — optimized for speed |
| **Live Progress** | Real-time table with per-step status during execution |
| **Cost Tracking** | Per-task and total token usage + dollar cost displayed on completion |
| **Audit Mode** | Each task runs in its own terminal window for real-time monitoring (`executor -a <plan_id>`) |
| **Resumable Plans** | Failed tasks can be retried; completed tasks are skipped automatically |
| **Dual Model Support** | Use different AI models for planning vs execution |
| **Process Safety** | Child processes auto-terminate on terminal close via Linux `PR_SET_PDEATHSIG` |
| **Stdin Support** | Pipe prompts directly: `echo "do X" \| planner` |

## Quick Install

```bash
git clone https://github.com/danub-io/turbo.git && cd turbo && pip install -e .
# Create symlinks for global access:
ln -sf "$(pwd)/.venv/bin/planner"    ~/.local/bin/planner
ln -sf "$(pwd)/.venv/bin/executor"   ~/.local/bin/executor
ln -sf "$(pwd)/.venv/bin/diagrammer" ~/.local/bin/diagrammer
```

> **Prerequisites:** Python 3.14+, Node.js 22.12+, git.

## Commands

```
planner [-a] "description"
  Plan + execute in one step. No confirmation needed.
  -a: open a terminal window per task (audit mode).

executor [-a] <plan_id>
  Execute an existing plan. Completed tasks are skipped.
  -a: open a terminal window per task.

diagrammer "description"
  Generate an ASCII diagram from a natural-language description.
```

### Pipe input

```bash
echo "Build a CLI tool" | planner
cat prompt.txt | planner
```

## Plan Structure

Plans are stored at `~/.ai/plans/<plan_id>/` by default. Set `TURBO_PLANS_DIR` to customize.

```
~/.ai/plans/20260521-120234/
├── plan.yaml          # Plan metadata, task list, status
└── tasks/
    ├── task-01.md     # Task 1: description + system prompt with checklist
    ├── task-02.md     # Task 2
    └── task-03.md     # Task 3
```

### plan.yaml format

```yaml
plan_id: "20260521-120234"
description: "Build a REST API with Fastify"
original_prompt: "Build a REST API with Fastify, Prisma, and JWT auth"
tasks:
  - id: 1
    description: "Initialize project and install dependencies"
    mode: serial
    task_file: "/home/user/.ai/plans/20260521-120234/tasks/task-01.md"
  - id: 2
    description: "Set up Prisma schema and migrations"
    mode: serial
    task_file: "/home/user/.ai/plans/20260521-120234/tasks/task-02.md"
  - id: 3
    description: "Implement auth and API routes"
    mode: parallel
    task_file: "/home/user/.ai/plans/20260521-120234/tasks/task-03.md"
```

## Configuration

### Provider & Model Selection

Turbo reads provider, model, and thinking budget from `model-provider-reference.md` in the Flow project's `public/` directory. Set checkboxes (`[x]`) in the **Planner** and **Executor** sections independently.

This lets you use a **stronger model for planning** (e.g., deepseek-v4-pro with high thinking) and a **cheaper model for execution** (e.g., deepseek-v4-flash with thinking off).

### Execution Modes

| Mode | YAML Value | Behavior |
|---|---|---|
| **Serial** | `mode: serial` | Tasks run one after another. Each waits for the previous to complete. |
| **Parallel** | `mode: parallel` | Independent tasks run concurrently. Same-file tasks are deduplicated. |

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| `TURBO_ROOT` | Project root directory | Auto-detected |
| `TURBO_PLANS_DIR` | Directory for generated plans | `~/.ai/plans/` |
| `PI_BIN` | Path to the pi binary | Auto-detected via `which pi` |
| `FLOWCRAFT_DIR` | Path to the flow project (system prompts, skills) | Sibling `flow/` directory |

## Project Structure

```
turbo/
├── src/turbo/
│   ├── cli.py                  CLI entrypoints (planner, executor, diagrammer)
│   ├── config.py               Config resolution
│   ├── display.py              Rich terminal output
│   ├── executor.py             Async task execution engine
│   ├── models.py               Dataclasses: Plan, Task, TaskMode, TaskStatus
│   ├── monitor.py              Plan status polling
│   ├── plan_reader.py          YAML + Markdown plan deserialization
│   ├── planner.py              Plan generation via pi agent
│   ├── proc.py                 Process safety helpers (PDEATHSIG)
│   ├── update_check.py         pi update notifications
│   └── visible_executor.py     Terminal-window-per-task execution
├── system/                     Legacy system prompts (actual prompts in flow/)
├── tests/                      Pytest test suite (160+ tests)
├── pyproject.toml
└── README.md
```

## Testing

```bash
.venv/bin/python -m pytest tests/ -v
.venv/bin/python -m ruff check src/ tests/
```
