---
title: "Commands"
---

## Execution

| Command | Description |
|---------|-------------|
| `python main.py` | Run the app |
| `python main.py -m gpt-4o` | Run with a specific model |
| `python main.py --model claude-sonnet-4-20250514` | Run with a specific model |
| `python main.py --provider anthropic` | Run with a specific provider |
| `python main.py --version` | Show version |
| `python main.py --plain` | Plain mode (no ANSI/Unicode) |

## Dependencies

| Command | Description |
|---------|-------------|
| `pip install -r requirements.txt` | Install dependencies |
| `python -m py_compile main.py` | Syntax check |

## Virtual Environment

| Command | Description |
|---------|-------------|
| `python3 -m venv .venv` | Create venv |
| `source .venv/bin/activate` | Activate venv |
| `deactivate` | Deactivate venv |

## API Key

| Method | Description |
|--------|-------------|
| First run | App detects provider via env var or interactive menu |
| Environment variable (generic) | `export TURBO_API_KEY="sk-..."` |
| Environment variable (per provider) | `OPENCODE_GO_API_KEY`, `GEMINI_API_KEY`, `ANTHROPIC_API_KEY`, `OPENAI_API_KEY` |
| Slash command | `/key sk-...` inside the app |
| Slash command (provider) | `/provider opencode` to switch provider |

## Global Installation (pipx)

```bash
# Install via pipx (optional)
pipx install turbo-cli

# Run
turbo-cli

# Uninstall
pipx uninstall turbo-cli
```

## Config Directory

```bash
# Location
~/.config/turbo-cli/

# Files
config.json    # API key, model, base_url
history.txt    # Command history

# Remove config (reset)
rm -rf ~/.config/turbo-cli/
```

## Health Check

```bash
# 1. Python installed
python --version

# 2. Dependencies installed
pip list | grep -E "prompt-toolkit|openai|rich|pydantic"

# 3. Config exists
test -f ~/.config/turbo-cli/config.json && echo "✓ Config OK"
```

## CLI Flags

| Flag | Description |
|------|-------------|
| `--version` | Show version |
| `--model`, `-m` | Specify model (e.g. `gpt-4o`) |
| `--provider` | Specify provider (e.g. `anthropic`, `gemini`, `opencode`) |
| `--plain` | Plain mode (no ANSI/Unicode) |

## Slash Commands

| Command | Description |
|---------|-------------|
| `/model <name>` | Change the LLM model |
| `/key <key>` | Change the API key |
| `/provider <name>` | Change the provider (opencode/gemini/anthropic/ollama/openai) |
| `/mode <name>` | Switch to a specific mode (normal, plan, code, ask) |
| `/plan <description>` | Create a new execution plan (enters Plan mode) |
| `/plan-menu` | List saved plans in `.ai/plans/` for selection |
| `/plan-abort` | Abort current planning and return to Normal mode |
| `/code <plan-path>` | Load a plan in Code mode for autonomous execution |
| `/code-reset` | Reset CodeAgent state |
| `/code-status` | Display the current plan execution status |
| `/add <path>` | Add file to active context (active files) |
| `/add --remove <path>` | Remove file from active context |
| `/clear` | Clear conversation history |
| `/quit` | Exit the app |
| `/end` | Exit the app (shortcut) |
| `/new` | Clear screen and start a new session |
| `/help` | Display the list of available commands |

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| Shift+Tab | Cycle through modes (Normal → Plan → Code → Ask → Normal) |
| Esc + Enter | Insert a new line in input |
| Enter | Send message |
| Ctrl+C | Copy selection to clipboard |
| Ctrl+V | Paste from clipboard |
