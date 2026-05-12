---
title: "turbo-cli — Inline LLM Assistant CLI"
---

Inline terminal assistant (Claude Code style) with **4 agent modes** for chatting with LLM models via API, built with Python and [prompt-toolkit](https://github.com/prompt-toolkit/python-prompt-toolkit).

## Features

- 🧠 **4 agent modes:** Normal (general bash), Plan (planning), Code (autonomous execution), Ask (conversation + fetch)
- 🏆 **Multi-provider:** OpenAI, Anthropic, Google Gemini, Ollama, and any OpenAI-compatible API
- ⚡ **DeepSeek optimized:** Default model (`deepseek-v4-flash`) with `temperature=0.0`, `parallel_tool_calls=false`, and 100% Prefix Cache hit on active files
- 📝 Multi-line input (Esc+Enter for new line, Enter to send)
- ⚡ Real-time streaming of responses
- 📋 Markdown formatting with syntax highlighting (rich)
- ⌨️ 15 slash commands (`/model`, `/key`, `/mode`, `/provider`, `/plan`, `/plan-menu`, `/plan-abort`, `/code`, `/code-reset`, `/code-status`, `/clear`, `/new`, `/quit`, `/end`, `/help`)
- 🔄 Compatible with any OpenAI-compatible API (OpenAI, Anthropic, DeepSeek, Google Gemini, Ollama, Groq, Together, etc.)
- 💾 Persistent command history
- ⚙️ Config at `~/.config/turbo-cli/config.json` (pydantic)
- 🔒 Circuit breaker in Code mode (protection against edits outside of allowed files)
- 📋 Plan system with checklist + HTML comment (no JSON metadata)
- 📁 Active files: up to 5 files in inline context via `add_to_context` tool or `/add`
- ✂️ Automatic context pruning (ephemeral tool outputs) — up to 80% token reduction

## Technologies

- **UI:** prompt-toolkit 3.x (Textual 8.x on the tui-textual branch)
- **Language:** Python 3.12+
- **LLM:** Custom multi-provider SDK (`OpenAICompatibleClient`, `AnthropicClient`, `GeminiClient`)
- **Formatting:** rich 13.x (markdown, syntax highlighting)
- **Config:** pydantic 2.x

## Installation

### Via pip install -e . (recommended)

```bash
git clone <repo-url> turbo-cli
cd turbo-cli

python3 -m venv .venv
source .venv/bin/activate
pip install -e .

# Run
turbo
```

### Alternative run methods

```bash
# After pip install -e .
turbo

# Via python -m
python -m turbo_cli

# Via main.py
python main.py
```

## Usage

```bash
# Activate venv and start
source .venv/bin/activate
turbo
```

### Slash Commands

| Command | Description |
|---------|-------------|
| `/model <name>` | Switch model (e.g. `/model gpt-4o-mini`) |
| `/key <key>` | Switch API key |
| `/mode [name]` | View/switch mode (normal/plan/code/ask) |
| `/provider [name]` | View/switch provider (opencode/gemini/anthropic/ollama/openai) |
| `/plan <desc>` | Create a plan automatically |
| `/plan-menu` | List and select saved plans |
| `/plan-abort` | Cancel ongoing planning |
| `/code <path>` | Load and execute a plan |
| `/code-reset` | Reset CodeAgent state |
| `/code-status` | View current plan progress |
| `/add <path>` | Add file to active context |
| `/add --remove <path>` | Remove file from active context |
| `/clear` | Clear conversation context |
| `/new` | Clear screen and start a new session |
| `/quit` | Exit |
| `/end` | Exit (shortcut) |
| `/help` | Show full help |

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| Enter | Send message |
| Esc+Enter | New line in input |
| Shift+Tab | Cycle through the 4 modes |
| Ctrl+C | Copy selection (when there is an active selection) |
| Ctrl+V | Paste from clipboard |

## Project Structure

```
turbo-cli/
├── main.py                  # Thin entrypoint (→ cli.py)
├── cli.py                   # CLI argparse + asyncio.run()
├── pyproject.toml           # Build system + entry point "turbo"
├── requirements.txt         # Dev-deps (pytest, mypy)
├── .env.example             # Template for API key
├── turbo_cli/
│   ├── __init__.py          # __version__
│   ├── __main__.py          # python -m turbo_cli
│   ├── app.py               # Main loop (prompt_toolkit)
│   ├── cli.py               # CLI argparse + asyncio.run()
│   ├── config.py            # ConfigModel (pydantic)
│   ├── llm.py               # Multi-provider LLMClient (OpenAI, Anthropic, Gemini)
│   ├── messages.py          # Rich formatting
│   ├── commands/
│   │   └── dispatcher.py    # Slash commands dispatch
│   ├── core/
│   │   └── orchestrator.py  # Tool dispatch, context pruning, system prompt
│   ├── memory/
│   │   ├── store.py         # MemoryStore (SQLite + FTS5)
│   │   └── idle_dream.py    # Idle-dream background consolidation
│   ├── shared/
│   │   ├── modes.py         # AgentMode enum + MODE_TOOLS
│   │   ├── state.py         # SessionState
│   │   ├── tools.py         # Tools (bash, read, write, edit, etc.)
│   │   ├── plugin_core.py   # ToolRegistry, BaseTool
│   │   ├── ui.py            # Branding, progress bar
│   │   ├── widgets.py       # ProgressWidget, AskUserDialog
│   │   ├── plan_parser.py   # Plan parsing (.md → tasks)
│   │   ├── plan_writer.py   # Plan generation
│   │   ├── repo_map.py      # Intelligent repo map
│   │   ├── mcp_bridge.py    # MCP tool discovery
│   │   └── task_progress.py # CodeAgent task tracking
│   └── agents/
│       ├── base.py          # Agent (ABC)
│       ├── normal.py        # NormalAgent
│       ├── plan.py          # PlanAgent
│       ├── code.py          # CodeAgent (autonomous execution)
│       └── ask.py           # AskAgent
```

## License

MIT
