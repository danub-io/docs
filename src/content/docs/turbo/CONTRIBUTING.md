---
title: "Contributing to Turbo"
---

# Contributing to Turbo

## Development Setup

```bash
git clone <repo-url>
cd turbo
python3 -m venv .venv
.venv/bin/pip3 install -e ".[dev]"

# Create global symlinks
ln -sf "$(pwd)/.venv/bin/planner"    ~/.local/bin/planner
ln -sf "$(pwd)//.venv/bin/executor"   ~/.local/bin/executor
ln -sf "$(pwd)/.venv/bin/diagrammer" ~/.local/bin/diagrammer
```

## Code Standards

- **Python:** `snake_case` for functions, methods, variables. `PascalCase` for classes and enums.
- **YAML keys:** `snake_case` always (e.g., `plan_id`, `task_file`, `original_prompt`)
- **Files:** `kebab-case` for documentation. `snake_case` for `.py` files.
- **Constants:** `UPPER_SNAKE_CASE`.
- **No Hungarian notation**, no type prefixes.

## Running Tests

```bash
.venv/bin/python -m pytest tests/ -v
```

### Key test areas

- CLI argument parsing and entry points
- Plan generation and YAML reading (including backward-compatible Portuguese keys)
- Task execution with mock pi subprocesses
- Parallel concurrency verification
- Process safety (PR_SET_PDEATHSIG)

## Linting

```bash
.venv/bin/python -m ruff check src/ tests/
```

All tests must pass with zero ruff warnings.

## Pull Request Guidelines

- Ensure all tests pass
- Ruff linting is clean
- Changes are focused and well-described in commit messages
- Update AGENTS.md if adding new commands or changing behavior
- Update documentation in `~/Documentos/docs/` if adding features

## ⚠️ Hard Rules

1. **Never edit files in `agents/` or `skills/`** — these are system prompts and skills for the pi agent. Edits can break the planner/executor pipelines.
2. **Never edit files in `public/model-provider-reference.md`** — this is the model configuration file read by turbo at runtime.
