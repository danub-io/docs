---
title: "Changelog"
---

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [0.3.1] — 2026-05-11

### Fixed
- **ANSI rendering — `?` characters in colors:** Removed `force_terminal=True` and `color_system="truecolor"` from rich; added `sys.__stdout__.isatty()` check in `_use_ansi()` to prevent ANSI escapes in pipes
- **Layout broken by `footer_app`:** Removed the second `prompt_toolkit` `Application` that ran concurrently and caused inconsistent redraws and input handling conflicts
- **Non-functional "Thinking..." spinner:** Replaced empty placeholder with a braille character animation managed via `asyncio.CancelledError`

### Changed
- **`_get_console()`:** Now uses rich auto-detection instead of forcing `color_system="truecolor"` — rich correctly detects terminal capabilities
- **Toolbar:** Simplified, removed the "THINKING..." indicator that depended on `footer_app`
- **Imports:** Removed 6 unused `prompt_toolkit` imports in `app.py`

### Added
- **Ctrl+C and Ctrl+V shortcuts:** Copy selection and paste from clipboard
- **`/end` and `/new` commands:** Exit and start a new session respectively

### Removed
- **`--no-color` CLI flag:** Replaced by automatic auto-detection via rich + TTY check

## [0.3.0] — 2026-05-11

### Added
- **`turbo` entry point:** Global CLI via `pip install -e .` + `pyproject.toml`
- **`turbo_cli/cli.py`:** Argparse with `--version` and `--model`, `_check_venv()` with 3 entry points
- **`turbo_cli/__main__.py`:** Support for `python -m turbo_cli`
- **Updated documentation:** index.mdx, README.md, CHANGELOG.md, CONTRIBUTING.md, setup-local.md, architecture/README.md, tui-flow.md reflect v0.3.0 architecture

### Changed
- **`main.py`:** Reduced to thin wrapper → `from turbo_cli.cli import main; main()`
- **`requirements.txt`:** Moved to dev-deps only (pytest, mypy), main deps in `pyproject.toml`

## [0.2.0] — 2026-05-11

### Added
- **4-agent system:** Normal, Plan, Code and Ask with dedicated system prompts and toolsets
- **`ask_user` tool in Plan mode:** Plan agent can now ask the user questions during planning
- **Custom text support in `AskUserDialog.select`:** User can type a free-form response in addition to choosing numeric options
- **`ask_user` usage instructions in `PLAN_SYSTEM_PROMPT`:** Plan agent is instructed to ask one question at a time with up to 5 options
- **Slash commands:** `/mode`, `/plan`, `/plan-menu`, `/plan-abort`, `/code`, `/code-reset`, `/code-status`, `/help`
- **Tab cycle:** Tab key cycles through the 4 modes sequentially
- **Circuit breaker:** Protection against edits outside of allowed files in Code mode
- **ProgressWidget:** Visual progress bar during plan execution in Code mode
- **Plan writer/parser:** Generation and reading of plans in `.ai/plans/*.md`

### Fixed
- **Inconsistency in app.py:** Standardized `messages[0] = {...}` to `messages.clear(); messages.append()` across all 4 mode-switch points, eliminating IndexError risk

## [0.1.0] — 2026-05-11

### Added
- **App loop with prompt_toolkit:** Claude Code-style inline prompt with persistent history
- **LLM Client:** Streaming via OpenAI SDK, compatible with any OpenAI-compatible provider
- **Config management:** Config at `~/.config/turbo-cli/config.json` via pydantic
- **Slash commands:** `/model`, `/key`, `/clear`, `/quit`
- **Rich formatting:** Markdown with syntax highlighting, panels, visual feedback
- **Multi-line input:** Esc+Enter for new line, Enter to send
