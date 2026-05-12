---
title: "Local Environment Setup"
---

## Prerequisites

- **Python** >= 3.12 — [Download](https://python.org/)
- **pip** and **venv** (included with Python)

## Setup

```bash
# 1. Clone the repository
git clone <repo-url> turbo-cli
cd turbo-cli

# 2. Create and activate virtual environment
python3 -m venv .venv
source .venv/bin/activate

# 3. Install dependencies
pip install -e .

# 4. Run locally (3 equivalent methods)
turbo
# python -m turbo_cli
# python main.py
```

## API Key

On first run, the app will prompt for the API key. You can also:

- Set the `TURBO_API_KEY` env var before running
- Copy `.env.example` to `.env` and fill it in

```bash
export TURBO_API_KEY="your-key-here"
turbo
```

## Verification

```bash
# Verify installation
turbo --version  # or python main.py --version

# Check config
cat ~/.config/turbo-cli/config.json

# Check history
cat ~/.config/turbo-cli/history.txt
```

## Development Structure

```
turbo-cli/
├── main.py                  # Thin entrypoint (→ cli.py)
├── cli.py                   # CLI argparse + asyncio.run()
├── pyproject.toml           # Build system + entry point "turbo"
├── requirements.txt         # Dev-deps (pytest, mypy)
├── .env.example
├── turbo_cli/
│   ├── __init__.py          # __version__
│   ├── __main__.py          # python -m turbo_cli
│   ├── app.py               # Main loop + tool dispatch
│   ├── config.py            # Config + API key
│   ├── llm.py               # LLM client
│   ├── messages.py          # Rich formatting
│   ├── shared/              # State, tools, plans
│   │   ├── modes.py
│   │   ├── state.py
│   │   ├── tools.py
│   │   ├── widgets.py
│   │   ├── plan_parser.py
│   │   └── plan_writer.py
│   └── agents/              # 4 agents
│       ├── base.py
│       ├── normal.py
│       ├── plan.py
│       ├── code.py
│       └── ask.py
```

## Useful Commands

```bash
# Python
turbo                          # Run (global entry point)
python -m turbo_cli          # Run via module
python main.py                  # Run via script
turbo --version                # Check version
turbo --plain                  # Plain mode (no ANSI/Unicode)

# Type checking
python -m mypy turbo_cli/ tests/

# Dependencies
pip install -e .                # Install in editable mode
pip install -r requirements.txt # Dev-deps
```
