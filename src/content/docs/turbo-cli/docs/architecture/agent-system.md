---
title: "Agent System"
---

## Overview

turbo-cli operates with **4 agents** (modes), each with its own system prompt and a specific set of tools. Switching between modes is done via Tab or the `/mode` command.

Each agent is a class that inherits from `Agent` (ABC) and implements `get_system_prompt()`. The available tools are declared in the `MODE_TOOLS` dictionary in `modes.py`.

## Agents

| Mode | Icon | Class | Purpose |
|------|------|-------|---------|
| Normal | ⚙️ | `NormalAgent` | General assistant with bash |
| Plan | 📋 | `PlanAgent` | Planning with `project_inspector` (no bash) |
| Code | ⚡ | `CodeAgent` | Autonomous plan execution |
| Ask | 💬 | `AskAgent` | General conversation + fetch |

## Tools per Mode

| Tool | Normal | Plan | Code | Ask |
|------|--------|------|------|-----|
| bash | ✓ | | ✓ | ✓ |
| read | ✓ | ✓ | ✓ | ✓ |
| write | ✓ | ✓ | ✓ | |
| edit | ✓ | ✓ | ✓ | |
| grep | ✓ | ✓ | ✓ | ✓ |
| find | ✓ | ✓ | ✓ | ✓ |
| ls | ✓ | | ✓ | ✓ |
| ask_user | | ✓ | ✓ | |
| fetch | | | | ✓ |
| update_task_progress | | | ✓ | |
| project_inspector | | ✓ | | |
| add_to_context | ✓ | ✓ | ✓ | |

## Plan Mode (PlanAgent)

The `PlanAgent` is responsible for **creating execution plans**. It **does not have access to bash** — all project exploration is done via `project_inspector` and `read`.

### Question Flow

The PlanAgent uses the `ask_user` tool in `select` mode to interact with the user during the requirements gathering phase:

1. **One question at a time** — the agent never asks multiple questions simultaneously
2. **Up to 5 predefined options** — the user can choose a number
3. **Custom text** — the user can also ignore the options and type their own response
4. **The plan is only created after all questions are answered**

### AskUserDialog.select

The `select` method of the `AskUserDialog` class (in `widgets.py`) displays numbered options and accepts:

| User Input | Result |
|------------|--------|
| Valid number (1-N) | Returns the corresponding option text |
| Free text | Returns the typed text (custom response) |
| Enter (empty) | Returns `None` (cancellation) |

## Code Mode (CodeAgent)

The `CodeAgent` executes plans autonomously:
- Loads a plan from the `.ai/plans/` directory
- Executes tasks sequentially with bash
- Validates exit code of each command
- Uses `update_task_progress` to mark completed tasks
- Rolls back via `git stash + reset --hard` on failure

### Circuit Breaker

In Code mode, edits to files outside of `allowedFiles` count 3 strikes before blocking the agent.

### Edit Tool in CodeAgent

The CodeAgent system prompt instructs the model to **always use `startLine` and `endLine`** in the `edit` tool, leaving `searchBlock` empty. This eliminates indentation failures that smaller models (such as DeepSeek Flash) make when replicating searchBlocks.

The `edit` tool description throughout the application has also been standardized to instruct the use of `startLine`/`endLine` with an empty `searchBlock`.

### Repo Map

The CodeAgent injects a **repo map** (structural project map using tree-sitter) into the system prompt, with a 4000-character limit. The PlanAgent also injects a repo map (2000 chars, 30 files). This eliminates redundant calls to `project_inspector.get_repo_map`.

## Active Files (Active Context)

Active files are files whose content is injected directly into the LLM system prompt, eliminating the need to call `read` repeatedly.

### How it works

1. The `add_to_context` tool (available in NORMAL, PLAN, CODE modes) adds/removes/lists files
2. Added files are read from disk and appended to the system prompt in XML format
3. The content is re-read on every prompt rebuild (always fresh)
4. When active files change, `messages[0]` is rebuilt for the next LLM round

### Limits

- Maximum **5 files**
- Each file limited to **5000 chars** (middle truncation)
- `add_to_context` with `operation=list` displays the active files

### Metadata and Prefix Caching

Active file metadata includes only the **line count** (`metadata: N lines`). Timestamps (`st_mtime`) and sizes (`st_size`) were removed — they invalidated the provider's Prefix Cache on every edit, especially critical for **DeepSeek** models that automatically cache the system prompt prefix. With stabilized metadata, the cache hit rate on active files reaches ~100%.

### Orthogonality with allowedFiles

Active files ≠ allowed_files. A file can be in active_files (read in context) without being in allowed_files (edit permission). The CodeAgent only edits files in allowed_files.

### Slash command

The `/add <path>` command adds to the active context. `/add --remove <path>` removes.

## Context Pruning (Ephemeral Tool Output)

To prevent tool outputs from accumulating and inflating the context, the system implements pruning at two levels:

1. **`_compact_completed_task_history`**: when a CodeAgent task is completed, removes the entire tool_calls + tool_results block for that task from the messages array and replaces it with a textual summary (e.g. `"✅ Task completed: Install dependencies | Bash: exit 0"`)
2. **`_compact_all_tool_outputs`**: scans residual tool messages between incomplete tasks and truncates any content > 200 chars with `_middle_truncate`, preserving the beginning and end
3. Pruning occurs **both in the non-streaming and streaming paths** (fixed in v0.3+)
4. Tool messages from the **current round** are never truncated

## Normal Mode (NormalAgent)

General assistant with full access to bash, file reading, and writing. It is the default mode when starting the app.

## Ask Mode (AskAgent)

General conversation and OS support mode, with access to fetch for web queries.

## Prompt Caching

The system implements two-level caching to reduce API calls and latency:

### `_prompt_cache` (per agent)

Each agent (NormalAgent, PlanAgent, CodeAgent, AskAgent) lazily caches its system prompt
via `get_cached_prompt()` in `agents/base.py`. The cache is populated on first call and reused
while the agent is active.

```python
class Agent(ABC):
    _prompt_cache: str | None = None

    def get_cached_prompt(self) -> str:
        if self._prompt_cache is None:
            self._prompt_cache = self.get_system_prompt()
        return self._prompt_cache
```

The cache can be invalidated via `invalidate_prompt_cache()` (available on the base `Agent` class since v0.3+), useful for extensions that modify the system prompt dynamically (e.g. active files, repo map refresh).

### `_tool_cache` (global per mode)

Tool definitions (`get_tool_definitions` in `tools.py`) are also cached per mode.
Each mode (NORMAL, PLAN, CODE, ASK) has its own set of tools, computed once
and reused.

### `_log_cached_tokens`

The `_log_cached_tokens` method in `llm.py` logs the number of cached tokens returned by the API
(using the `PromptTokensDetails.cached_tokens` field from the OpenAI SDK). This allows monitoring
the effectiveness of the provider's context cache.

## Parallel Tool Call Execution

The `_process_tool_calls_batch` method in `app.py` processes multiple tool_calls in an optimized way:

- **Non-interactive calls** (simple bash, read, grep, find, ls) are executed in parallel via
  `asyncio.gather`
- **Interactive calls** (ask_user, destructive bash, update_task_progress with rollback) are executed
  sequentially to preserve order and allow user interaction
- In case of 2+ consecutive bash errors, a system message is injected to guide the LLM

The classifier `_is_tool_interactive` determines whether a tool_call is interactive:
- `ask_user`: always interactive
- `bash` with destructive command (`rm -rf`, `dd`, `mkfs`, etc.): interactive
- `update_task_progress action=rollback`: interactive

## Streaming in CODE Mode

CODE mode (and also NORMAL and ASK) uses `_stream_tool_calls_from_stream` to process
API responses in streaming. The flow is:

1. Tries streaming via `client.stream_chat()`
2. If streaming fails (exception), returns `__FALLBACK__` for the caller to use the traditional mode
3. During streaming, collects text tokens and tool_calls incrementally
4. `CompletionUsage` chunks update the total token count
5. Accumulated tool_calls are processed via `_process_tool_calls_batch`

## Benchmark

The `scripts/benchmark.py` script measures `LLMClient` performance:

- Runs 3 rounds of chat_completion with tools (bash, read)
- Collects: prompt_tokens, completion_tokens, cached_tokens, latency per request
- Saves results to `scripts/benchmark-results.json` with timestamp
- Supports `--save <label>` and `--compare <label_a> <label_b>`

Usage:
```bash
python scripts/benchmark.py --save baseline       # Before optimizations
python scripts/benchmark.py --save after-optimization  # After
python scripts/benchmark.py --compare baseline after-optimization  # Comparison
```

## LLMClient — Performance Metrics

The `LLMClient` in `llm.py` exposes `last_request_duration` (property) that returns the time
in seconds of the last API call, for both `chat_completion` and `stream_chat`.
This allows real-time latency monitoring.

## Middle Truncation

Message history goes through intelligent truncation via `_middle_truncate` in `app.py`:
- Preserves the beginning (60%) and end (40%) of very long tool results
- Inserts a `[... truncated: N chars ...]` marker in the middle
- Prevents loss of relevant context at message boundaries

## Model-Specific Behavior (DeepSeek)

**DeepSeek** family models receive automatic optimizations when detected via `_is_deepseek()` in the `OpenAICompatibleClient`:

| Parameter | DeepSeek | Other models |
|-----------|----------|--------------|
| `temperature` | `0.0` (forced) | API default (not sent) |
| `parallel_tool_calls` | `false` (forced) | `true` (configurable via `ConfigModel`) |

### Why?

- **temperature=0.0**: DeepSeek Flash tends to be overly creative in tool calling. Forcing zero temperature eliminates hallucinations in file names, parameters, and bash commands.
- **parallel_tool_calls=false**: DeepSeek Flash often hallucinates parameters or mixes arguments when invoking 3+ tools simultaneously. Sequential execution is more reliable.

### Edit Tool

The CodeAgent system prompt and the `edit` tool description explicitly instruct the use of `startLine`/`endLine` with an empty `searchBlock`. DeepSeek models struggle to replicate exact indentation for searchBlock; DIRECT REPLACEMENT by lines is more accurate.

## Related Files

| File | Description |
|------|-------------|
| `turbo_cli/agents/base.py` | `Agent` base class (ABC) + prompt cache |
| `turbo_cli/agents/normal.py` | `NormalAgent` |
| `turbo_cli/agents/plan.py` | `PlanAgent` + `PLAN_SYSTEM_PROMPT` |
| `turbo_cli/agents/code.py` | `CodeAgent` + repo_map injection |
| `turbo_cli/agents/ask.py` | `AskAgent` |
| `turbo_cli/shared/modes.py` | `AgentMode` enum, `MODE_TOOLS`, `MODE_LABELS` |
| `turbo_cli/shared/widgets.py` | `AskUserDialog` (input, confirm, select) |
| `turbo_cli/llm.py` | `LLMClient` + `_log_cached_tokens` + timing |
| `turbo_cli/shared/tools.py` | Tool definitions (incl. `add_to_context`) + `_tool_cache` + `_validate_file_access` |
| `scripts/benchmark.py` | Reproducible benchmark script |
