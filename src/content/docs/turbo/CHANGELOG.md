---
title: 'Turbo Changelog'
---

# Changelog — Turbo

## 0.2.0 (2026-05-29)

### Added

- **Director agent** with mode routing (`/critic`, `/smart` prefixes)
- **Standardized canonical sections** (C0–C8) across all mode files
  - C0: Autonomous Execution Mandate — "agents do not assist, they DO"
  - C6: Self-Verification with completeness check (KRAFTON D)
  - C7: Anti-Patterns tables in smart, critic, planner, executor
- **KRAFTON-inspired improvements** across all prompts:
  - No human handoff, no partial work, submission is FINAL
  - Self-evaluation of completeness (step-by-step verification)
  - Adaptive replanning and fail-fast principles
  - "No eyes/ears → use tools" principle
  - Scope clarification for vague prompts
  - Re-evaluation checkpoints in plans
- `turbo-tui` entry point (full-screen terminal interface)
- `manager` CLI command (task decomposition agent)
- `draw` CLI command (diagram generation)

### Changed

- System prompts moved to `agents/director/` (AGENTS.md + modes/), no longer read from Flow project
- All CLI entry points updated in `pyproject.toml`
- Architecture: user → Director (single POC) → agent pipeline
- Manager, planner, executor prompts rewritten with standardized sections
- `AGENTS.md` base prompt updated with autonomous execution philosophy

### Documentation

- ARCHITECTURE.md fully rewritten to reflect current Director + modes architecture
- index.mdx updated with new CLI commands, philosophy, and system prompt locations

## 0.1.0 (2026-05-24)

### Added

- Three new CLI commands replacing the monolithic `turbo` entry point:
  - `planner` — plan + auto-execute (replaces `turbo -q` without the confirmation prompt)
  - `executor` — execute existing plan (replaces `turbo exec`)
  - `diagrammer` — generate ASCII diagrams (replaces `turbo -d`)
- `-a` flag support for `executor` (visible terminal windows per task)
- `-a` flag support for `planner` (visible terminal windows during execution)

### Changed

- `turbo` command removed — no longer available as a terminal entry point
- `pyproject.toml` entry points updated to register only `planner`, `executor`, `diagrammer`
- System prompts now read from the Flow project (`flow/agents/<role>/prompt.md`) instead of local `system/` directory
- Help messages updated from `turbo -a` to `executor -a`

### Removed

- `turbo` entry point from `[project.scripts]`
- `turbo` symlink from `~/.local/bin/`

## 0.1.0-dev (2026-05-21)

### Added

- Initial project scaffold with Python CLI
- Planner module for AI-powered plan generation via pi agent
- Executor module for serial and parallel task execution
- Visible executor for per-task terminal windows
- Rich terminal display with progress tables
- YAML/Markdown plan reader with backward-compatible Portuguese keys
- Process safety via PR_SET_PDEATHSIG
- pi update check with caching
- 160+ pytest tests
