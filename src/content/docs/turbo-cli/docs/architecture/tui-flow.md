---
title: "App Loop Flow — 4 Agents with Tool Dispatch"
---

## Overview

The app loop is built with [prompt-toolkit](https://github.com/prompt-toolkit/python-prompt-toolkit) 3.x and operates with **4 agent modes** (Normal, Plan, Code, Ask). Each mode has its own system prompt and toolset. The main flow replaces direct streaming with a **tool dispatch** loop (`_chat_completion_with_tools`) that allows the LLM to call tools like bash, read, write, edit, etc.

## Components

```
turbo / python -m turbo_cli / python main.py
  └── cli.py: main()
        └── asyncio.run(run(initial_model, initial_provider))
              └── app.py: run()
                    ├── load_config()               ← ~/.config/turbo-cli/config.json
                    ├── ensure_api_key()             ← auto-detect provider via env var
                    ├── LLMClient(config)             ← Factory: OpenAI / Anthropic / Gemini
                    ├── agents: dict[AgentMode, Agent] ← 4 agents instantiated
                    ├── PromptSession(history)        ← prompt_toolkit
                    ├── print_welcome()               ← rich panel
                    └── loop:
                        ├── prompt_async(">>> ")      ← awaits input
                        ├── input.startswith("/") → _handle_slash_command()
                         │   ├── /model, /key, /provider  ← config
                         │   ├── /mode [name]          ← mode switch
                         │   ├── /plan <desc>          ← create plan (PlanAgent)
                         │   ├── /plan-menu            ← list plans
                         │   ├── /plan-abort           ← cancel planning
                         │   ├── /code <path>          ← execute plan (CodeAgent)
                         │   ├── /code-reset /code-status
                         │   ├── /clear                ← clear context
                         │   ├── /new                  ← clear screen and restart
                         │   ├── /quit /end            ← exit
                         │   └── /help                 ← help
                        └── else:
                            ├── messages.append(user)
                            ├── _chat_completion_with_tools()
                            │   ├── LLM sends tool_calls or text + reasoning_content
                            │   ├── If tool_calls: execute_tool() → result
                            │   ├── If text: print_response() → append
                            │   └── Max 30 tool rounds
                            └── _check_completion()   ← PlanAgent extracts plan
```

## Detailed Flow

### 1. Initialization (`app.py:81-131`)

```python
async def run(initial_model: str | None = None) -> None:
    cfg = load_config()                      # Load config from disk
    if initial_model:
        cfg.model = initial_model            # --model from CLI
    ensure_api_key(cfg)                      # Prompt for key if empty
    client = LLMClient(cfg)                   # SDK AsyncOpenAI

    messages = [{"role": "system",
                 "content": _system_prompt_for_mode(state.mode)}]
    state.set_messages(messages)

    session = PromptSession(history=FileHistory(...))
    print_welcome()
```

### 2. Tool Dispatch (`_chat_completion_with_tools`, line 197)

The heart of the app is a loop that alternates between calling the LLM and executing the returned tool_calls:

1. Calls `client.chat_completion(messages, tools=tools)` with the current mode's tools
2. If the LLM returns `tool_calls`:
   - Adds an `assistant` message with `tool_calls` to history
   - For each tool_call, executes `execute_tool(name, params, state)`
   - Adds result as a `tool` message
   - Repeats (max 100 rounds)
3. If the LLM returns text:
   - In Code mode: forces retry up to 2x to obtain tool_calls
   - Displays response via `print_response()` (rich Markdown)
   - Adds `assistant` message to history
   - Returns

### 3. Mode Switching

Shift+Tab or `/mode` cycles through the 4 modes:

- **Normal** ⚙️ — read, bash, edit, write, grep, find, ls
- **Plan** 📋 — read, grep, write, edit, project_inspector (no bash)
- **Code** ⚡ — read, bash, edit, write, grep, find, ls, ask_user, update_task_progress
- **Ask** 💬 — read, bash, grep, find, ls, fetch

Each switch clears the message history and reloads the new mode's system prompt.

### 4. Plan System

The PlanAgent generates plans with a `- [ ]` checklist and a JSON metadata block. When the LLM finishes with "Plan completed.":

1. `extract_and_save_plan()` saves to `.ai/plans/`
2. Menu asks: execute (→ CodeAgent) or adjust
3. CodeAgent loads the plan and executes tasks sequentially
4. `update_task_progress` marks completion
5. Circuit breaker (3 strikes) protects against edits outside of `allowedFiles`

### 5. LLMClient (`turbo_cli/llm.py`)

The `LLMClient` is a factory that instantiates the correct client based on the configured provider:

| Provider | Class | SDK | Models |
|----------|-------|-----|--------|
| `opencode` / `openai` / `ollama` | `OpenAICompatibleClient` | httpx (directly) | DeepSeek, GPT-4o, Llama, Qwen, etc. |
| `anthropic` | `AnthropicClient` | `anthropic` SDK | Claude 3/4 |
| `gemini` | `GeminiClient` | `google-generativeai` | Gemini 1.5/2.0 |

**DeepSeek optimizations:** when the model name contains "deepseek", the `OpenAICompatibleClient` forces `temperature=0.0` and disables `parallel_tool_calls` for greater reliability.

**Reasoning Content:** DeepSeek R1 and other reasoning models return `reasoning_content` separate from the main content, preserved in `UnifiedMessage.reasoning_content`.

```python
class LLMClient(BaseLLMClient):
    def __init__(self, config: ConfigModel):
        self._inner = self._build_client(config)  # Factory dispatch

    # Delegates to _inner (OpenAICompatibleClient, GeminiClient or AnthropicClient)
    async def chat_completion(self, messages, tools=None, tool_choice=None):
        return await self._inner.chat_completion(messages, tools, tool_choice)
```

### 6. Messages (`turbo_cli/messages.py`)

Uses [rich](https://github.com/Textualize/rich) for formatting:

- `print_welcome()` — Welcome panel with title
- `print_response()` — Markdown inside a Panel
- `print_error()` / `print_info()` — Colored visual feedback
- `show_thinking_spinner()` — Animated spinner (braille) during tool dispatch

## Complete Interaction Flow

```
1. User runs: turbo (or python -m turbo_cli, python main.py)
2. cli.py: main() → asyncio.run(run())
3. app.run():
   a. Loads config from ~/.config/turbo-cli/config.json
   b. If API key is empty, prompts and saves
   c. Creates LLMClient, PromptSession, instantiates 4 agents
   d. Displays welcome
4. Loop:
   a. Shows prompt ">>> " with toolbar (mode + model)
   b. User types message + Enter
   c. If "/mode code" → switches to CodeAgent
   d. If "/plan create an endpoint" → switches to PlanAgent
   e. If "/plan-menu" → lists available plans
   f. If "/code .ai/plans/my-plan.md" → loads and executes
   g. If text → _chat_completion_with_tools()
      - LLM returns tool_calls (bash, read, write, etc.)
      - Executes each tool, returns result
      - LLM processes result, decides next step
      - Until final text response
   h. Response displayed with rich
5. Shift+Tab → switches mode
```

## Layout

```
┌──────────────────────────────────────────────┐
│  turbo-cli  |  Inline LLM Assistant        │
├──────────────────────────────────────────────┤
│                                              │
│  >>> list the project files                   │
│                                              │
│  ┌────────────────────────────────────────┐  │
│  │  I'll use bash to list.                │  │
│  │  [bash: ls -la]                        │  │
│  │  total 48                              │  │
│  │  drwxr-xr-x ... src/                   │  │
│  │  ...                                   │  │
│  └────────────────────────────────────────┘  │
│                                              │
│  >>> /plan create README                      │
│  📋 Mode changed to: Plan                     │
│  📄 Plan saved in .ai/plans/plan.md           │
│                                              │
├──────────────────────────────────────────────┤
│  ⚙️ Normal | Model: gpt-4o | Shift+Tab      │
└──────────────────────────────────────────────┘
```

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| Enter | Send message |
| Esc+Enter | New line in input |
| Shift+Tab | Cycle through the 4 modes |
| Ctrl+C | Copy selection (when there is an active selection) |
| Ctrl+V | Paste from clipboard |

## Slash Commands

| Command | Description |
|---------|-------------|
| `/model <name>` | Switch model (e.g. `/model gpt-4o-mini`) |
| `/key <key>` | Switch API key |
| `/provider <name>` | Switch provider (opencode/gemini/anthropic/ollama/openai) |
| `/mode [name]` | View/switch mode (normal/plan/code/ask) |
| `/plan <desc>` | Create a plan automatically |
| `/plan-menu` | List and select saved plans |
| `/plan-abort` | Cancel ongoing planning |
| `/code <path>` | Load and execute a plan |
| `/code-reset` | Reset CodeAgent state |
| `/code-status` | View current plan progress |
| `/clear` | Clear conversation context |
| `/new` | Clear screen and start a new session |
| `/quit` | Exit |
| `/end` | Exit (shortcut) |
| `/help` | Show full help |
