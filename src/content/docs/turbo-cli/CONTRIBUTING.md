---
title: "Contributing — turbo-cli"
---

Contribution guide for the turbo-cli project.

## Prerequisites

- Python >= 3.12
- pip/venv

## Environment Setup

```bash
# Clone
git clone <repo-url> turbo-cli
cd turbo-cli

# Create and activate venv
python3 -m venv .venv
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

## Best Practices

- **Rich Console:** when modifying `Console` configuration from rich, never force a fixed `force_terminal` or `color_system` — use auto-detection (let rich detect terminal capabilities automatically)
- **prompt_toolkit:** do not create a second concurrent `Application`; any additional UI must use existing callbacks (`bottom_toolbar`, etc.)
- **Manual ANSI codes:** always check `sys.__stdout__.isatty()` before emitting ANSI escape sequences directly

## Contribution Structure

### Entrypoints
- `main.py` — Thin wrapper → `from turbo_cli.cli import main; main()`
- `turbo_cli/cli.py` — CLI argparse (--version, --model, --plain), asyncio.run()
- `turbo_cli/__main__.py` — Support for `python -m turbo_cli`
- `pyproject.toml` — Build system + entry point `turbo = "turbo_cli.cli:main"`

### App (`turbo_cli/`)
- `app.py` — Main prompt_toolkit loop, slash commands, tool dispatch (`_chat_completion_with_tools`)
- `config.py` — ConfigModel pydantic, API key, load/save
- `llm.py` — LLMClient (OpenAI SDK), streaming + chat completion
- `messages.py` — Rich formatting (markdown, panels, animated braille spinner)

### Agents (`turbo_cli/agents/`)
- `base.py` — Agent (ABC): mode + system prompt
- `normal.py` — NormalAgent: general assistant with bash
- `plan.py` — PlanAgent: planning with project_inspector
- `code.py` — CodeAgent: autonomous executor with plans and circuit breaker
- `ask.py` — AskAgent: general conversation + fetch

### Shared (`turbo_cli/shared/`)
- `modes.py` — AgentMode enum, MODE_TOOLS, MODE_LABELS
- `state.py` — SessionState (mode, messages, plan, circuit breaker)
- `tools.py` — Tool definitions and execution (bash, read, write, edit, etc.)
- `ui.py` — Branding, box chars, render_progress_bar
- `widgets.py` — ProgressWidget, AskUserDialog (input/confirm/select)
- `plan_parser.py` — Plan parsing (markdown checklist + JSON metadata)
- `plan_writer.py` — Plan generation and extraction

## Workflow

1. Create a branch from `main`
2. Make the necessary changes
3. Test manually with `turbo` or `python main.py`
4. Commit with a descriptive message
5. Open a Pull Request

## Reporting Bugs

- Describe the problem with steps to reproduce
- Include relevant output (terminal errors, Python stack trace)
- Inform Python version, model, and provider used

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
