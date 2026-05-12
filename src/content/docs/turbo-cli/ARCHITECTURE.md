---
title: "Architecture — turbo-cli"
---

## Overview

turbo-cli is an inline TUI client for LLMs with a multi-agent system, organized in layers:

1. **Entrypoint** (`main.py` → `cli.py`) — Python script that initializes config, LLM client, and app loop
2. **Config** (`turbo_cli/config.py`) — API key, model, provider, and base_url management via pydantic
3. **LLM** (`turbo_cli/llm.py`) — Multi-provider client: OpenAI, Anthropic, Gemini, Ollama
4. **App Loop** (`turbo_cli/app.py`) — Main loop with prompt_toolkit, tool dispatch, mode switching
5. **Core** (`turbo_cli/core/orchestrator.py`) — Tool dispatch, context pruning, system prompt construction
6. **Agents** (`turbo_cli/agents/`) — 4 modes with distinct system prompts and toolsets
7. **Shared** (`turbo_cli/shared/`) — Tools, session state, UI widgets

```
┌──────────────────────────────────────────────────────────────┐
│                      turbo-cli (Python)                    │
│                                                               │
│  main.py → cli.py                                             │
│    └── asyncio.run(run(initial_model))                        │
│                   │                                            │
│                   ▼                                            │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  app.py (prompt_toolkit)                                 │  │
│  │  ├── load_config()     → ~/.config/turbo-cli/         │  │
│  │  ├── ensure_api_key()  → auto-detect provider            │  │
│  │  ├── LLMClient(config) → multi-provider factory          │  │
│  │  ├── agents[4]         → Normal/Plan/Code/Ask            │  │
│  │  ├── loop: prompt → dispatcher or chat_completion         │  │
│  │  └── idle_dream        → background memory consolidation  │  │
│  └──────────────────┬───────────────────────────────────────┘  │
│                     │                                           │
│  ┌──────────────────▼───────────────────────────────────────┐  │
│  │  core/orchestrator.py                                    │  │
│  │  ├── chat_completion_with_tools() → tool dispatch loop    │  │
│  │  ├── system_prompt_for_mode()    → prompt + context      │  │
│  │  ├── _build_code_context()       → active files + mem    │  │
│  │  └── context pruning (sliding window + summaries)        │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                               │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  llm.py (BaseLLMClient factory)                          │  │
│  │  ├── OpenAICompatibleClient → OpenAI, DeepSeek, Ollama   │  │
│  │  │   ├── _is_deepseek() → temp=0, parallel=false         │  │
│  │  ├── GeminiClient → Google Gemini (native SDK)           │  │
│  │  ├── AnthropicClient → Anthropic Claude (native SDK)     │  │
│  │  └── chat_completion() / stream_chat()                   │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                               │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  agents/                                                 │  │
│  │  ├── base.py          → Agent (ABC)                      │  │
│  │  ├── normal.py        → NormalAgent (general bash)       │  │
│  │  ├── plan.py          → PlanAgent (planning)             │  │
│  │  ├── code.py          → CodeAgent (autonomous execution)  │  │
│  │  └── ask.py           → AskAgent (query + fetch)         │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                               │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  commands/dispatcher.py                                  │  │
│  │  └── handle_slash_command() → /model, /key, /provider..  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                               │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  memory/                                                 │  │
│  │  ├── store.py        → MemoryStore (SQLite + FTS5)       │  │
│  │  └── idle_dream.py   → Background memory consolidation   │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                               │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  shared/                                                 │  │
│  │  ├── modes.py        → AgentMode enum, MODE_TOOLS        │  │
│  │  ├── state.py        → SessionState (active files, etc)  │  │
│  │  ├── tools.py        → Tools + tool registry             │  │
│  │  ├── plugin_core.py  → ToolRegistry, BaseTool, load_... │  │
│  │  ├── widgets.py      → ProgressWidget, AskUserDialog     │  │
│  │  ├── plan_parser.py  → Plan parsing                      │  │
│  │  ├── plan_writer.py  → Plan generation                   │  │
│  │  ├── ui.py           → Branding, progress bar            │  │
│  │  ├── repo_map.py     → Intelligent repo map              │  │
│  │  ├── mcp_bridge.py   → MCP tool discovery                │  │
│  │  └── task_progress.py→ CodeAgent task tracking           │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                               │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  messages.py (rich formatting)                           │  │
│  │  ├── print_welcome() — welcome panel                    │  │
│  │  ├── print_response() — Markdown + Panel                  │  │
│  │  ├── print_error() / print_info() — feedback              │  │
│  │  └── print_streaming_chunk() — raw output                │  │
│  └──────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

## ConfigModel

Managed by `turbo_cli/config.py` via pydantic `BaseModel`, saved at `~/.config/turbo-cli/config.json`:

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `api_key` | `str` | `""` | API key |
| `model` | `str` | `"deepseek-v4-flash"` | Model name |
| `base_url` | `str` | `""` (auto-resolved) | API base URL |
| `provider` | `str` | `"opencode"` | Provider (opencode/gemini/anthropic/ollama/openai) |
| `plain_mode` | `bool` | `false` | ANSI/Unicode-free mode |
| `parallel_tool_calls` | `bool` | `true` | Tool parallelism (auto-disabled for DeepSeek) |
| `max_tool_rounds` | `int` | `30` | Max tool rounds per request |
| `cheap_model` | `str` | `""` | Cheap model for light tasks (idle-dream) |
| `context_window` | `int` | `128000` | Context window in tokens |

### Provider Detection

The system automatically detects the provider based on environment variables:

| Provider | Env Key | Default URL |
|----------|---------|-------------|
| opencode | `OPENCODE_GO_API_KEY` | `https://opencode.ai/zen/go/v1` |
| gemini | `GEMINI_API_KEY` | `https://generativelanguage.googleapis.com/v1beta` |
| anthropic | `ANTHROPIC_API_KEY` | `https://api.anthropic.com/v1` |
| ollama | — (no key) | `http://localhost:11434/v1` |
| openai | `OPENAI_API_KEY` | `https://api.openai.com/v1` |

On first run with no provider configured, the app displays an interactive selection menu. The default model is `deepseek-v4-flash` on the `opencode` provider.

### Model-Specific Behavior

**DeepSeek** family models receive automatic optimizations in `OpenAICompatibleClient`:

| Parameter | DeepSeek | Other models |
|-----------|----------|--------------|
| `temperature` | `0.0` (forced) | API default |
| `parallel_tool_calls` | `false` (forced) | `true` (configurable) |

### Context Window

The system maintains a dictionary of known context windows (~35 models from 8 providers) in `config.py:_MODEL_CONTEXT_WINDOWS`. Resolution is done via `resolve_context_window(model_name)` with fuzzy fallback (substring match) and a default of 128k tokens.

## Message Flow with Tools

The app loop uses `chat_completion_with_tools()` in `core/orchestrator.py` to manage tool calls:

1. User sends a message → `messages.append({"role": "user", "content": text})`
2. `client.chat_completion(messages, tools=TOOL_DEFS[mode])` → LLM responds with text or `tool_calls`
3. If `tool_calls`: execute the tool, append the result as a `tool` message, repeat step 2
4. If text: print response with rich, append as `assistant`

## Agent System

The app has **4 modes** (agents), each with a dedicated system prompt and toolset:

| Mode | Tools | Purpose |
|------|-------|---------|
| Normal | read, bash, edit, write, grep, find, ls | General assistant with bash |
| Plan | read, grep, write, edit, project_inspector, ask_user | Planning (no bash) |
| Code | read, bash, edit, write, grep, find, ls, ask_user, update_task_progress | Autonomous plan execution |
| Ask | read, bash, grep, find, ls, fetch | General conversation + fetch |

## App Loop States

| State | Description |
|-------|-------------|
| Waiting | Empty prompt, awaiting input |
| Processing | Streaming response in progress |
| Tool call | LLM requested tool execution |
| Error | Request failure (timeout, auth, quota) |

## Config Directory: ~/.config/turbo-cli/

| File | Purpose |
|------|---------|
| `config.json` | API key, model, provider, base_url, plain mode, parallelism |
| `history.txt` | Command history (prompt_toolkit) |

## Execution Plan

Plans are saved in `.ai/plans/*.md` with a checklist format (`- [ ]`) + HTML comment for allowed files:

```markdown
# Plan Title

## Objective
Description of what will be done.

## Tasks

- [ ] Clear, actionable task description
- [ ] Each task should be small (5-15 lines of code at most)

<!-- allowedFiles: [path/to/file.py] -->
```

The CodeAgent loads these plans and executes tasks sequentially, with git rollback on failure and a circuit breaker (3 strikes) for edits outside of allowed files.
