---
title: "Context Compression"
---

Turbo Code uses a multi-layered context management system to keep conversation history within the model's context window. Two complementary strategies work together to minimize token usage without losing critical information.

## Overview

```
Main Loop (every tool round)
  │
  ├─ Phase 3: Distillation (if cheapModel set)
  │     └─ Async LLM summarization of old turns
  │
  ├─ Phase 4: Compression Pipeline
  │     ├─ 1. Retroactive sync compression
  │     │     └─ PromptCompressor on individual tool outputs > 4000 bytes
  │     ├─ 2. Async LLM compression (fire-and-forget)
  │     │     └─ compressConversation() on old conversation turns
  │     └─ 3. Emergency fallback (if still > 80% context)
  │           └─ compressOldToolOutputs with halved threshold
  │
  ├─ Per LLM response: compressToolCallArgs
  └─ Per tool execution: PromptCompressor on large outputs
```

## Trigger Conditions

All compression strategies share a common guard: context must exceed **40% of the model's context window** (`PRUNE_TOKEN_RATIO`), and at least **2 tool rounds** must have passed since the last intervention.

The token estimator counts characters plus structural overhead (20 chars/message + 50 chars/tool_call) divided by 4.

## Layer 1: Retroactive Sync Compression

On every tool round (when the 40% threshold is met), a synchronous pass scans all messages for tool/assistant outputs exceeding `compressionThreshold` (default 4000 bytes) and compresses them using `PromptCompressor.compress()` at `compressionRatio` (default 0.5).

This is a mechanical compression — it preserves all file paths, URLs, numbers, and code blocks while reducing verbose sections. It emits:

```
🧠 compressed N old tool outputs (saved ~M tokens, T total this session)
```

## Layer 2: Async LLM Compression

An asynchronous LLM call summarizes older conversation turns into a single `_compressed` user message. The process:

1. **Cutoff**: walks backwards from the end of messages, keeping the last 3 tool rounds (`KEEP_TOOL_ROUNDS`). Everything before that round gets compressed.
2. **Filtering**: removes dynamic blocks (`_active_files`, `_memories`, `_plan`, `_compressed`, `_continue`) and tool-result messages.
3. **Formatting**: builds a condensed transcript with `User: {content}` and `Assistant tools: funcName(args) => result` format.
4. **LLM call**: sends the formatted conversation to the LLM with a compression prompt. The model resolution follows: `compressionModel` → `cheapModel` → main model.
5. **Safety**: runs asynchronously (fire-and-forget) so the main loop is never blocked. 30-second timeout. If the result is empty or the LLM aborts, it returns `null` silently.
6. **Application**: on success, replaces old messages with the summary. Race-condition safe — `applyCompression()` caps removal at the original count, protecting messages added while compression was in flight.

### Compression Prompt

The LLM receives a system prompt instructing it to:

- Preserve ALL file paths mentioned
- Preserve ALL commands executed and their key results
- Preserve ALL errors, warnings, and how they were resolved
- Preserve ALL decisions made and their rationale
- Preserve the current project state and what remains to be done
- Preserve specific numbers, line counts, error messages, and data values

### Events

| Phase | Event |
|-------|-------|
| Start | `🧠 Compressing context... (~N tokens, keeping last K rounds)` |
| Success | `🧠 Context compressed: ~N → ~M tokens (P% of W)` |
| Silence | No event on failure or empty result |

## Layer 3: Emergency Fallback

After the async compression is dispatched, if the context still exceeds **80%** of the effective context window, a synchronous emergency pass runs with a **halved compression threshold** (2000 bytes instead of 4000):

```
⚠️ Emergency: compressed N outputs with lower threshold (saved ~M tokens)
```

This requires only 1 tool round since the last intervention (instead of the usual 2).

## Layer 4: Per-Output Compression (always active)

### Read-only tools

Tool outputs from grep, read, find, ls, fetch, and project_inspector are compressed inline if they exceed `compressionThreshold` (4000 bytes). If still over `MAX_TOOL_OUTPUT_LENGTH` (8000 bytes), the output is truncated with head (2000) / tail (6000) and a `[N chars omitted]` marker.

### Write/edit tools

Outputs exceeding 500 chars are replaced with a summary: `{firstLine} — 📄 {N} bytes, {M} lines written. Use \`read\` to view content.`

### Tool call arguments

Tool call arguments are compressed inline before being stored in history. If JSON-stringified arguments exceed 1000 chars, and a `content` field exceeds 500 chars, the content is replaced with a placeholder like `📄 1500 chars written to src/foo.ts`.

## Layer 5: Distillation (opt-in)

When a `cheapModel` is configured, the orchestrator also runs **distillation** — a second async LLM call that produces a structured summary (decisions, code, commands, errors, state) targeting 500–1000 tokens. This fires when context exceeds **50%** of the window (`DISTILL_TOKEN_RATIO`).

Distillation uses a different prompt focused on structured extraction and emits:

```
🧠 Distilling context... (~N tokens, keeping last turn intact)
🧠 Context distilled: ~N → ~M tokens (P% of W)
🧠 Distillation cache hit — skipping (history unchanged)
```

## Session State

The `SessionState` class tracks compression state:

| Field | Purpose |
|-------|---------|
| `compressionInProgress` | Prevents double-triggering |
| `compressionFailed` | Triggers 30s cooldown before retry |
| `lastCompressionAt` | Timestamp for cooldown enforcement |
| `compressionSavedChars` | Cumulative telemetry across session |

Cooldown behavior:
- After success or failure, no compression runs for 30s (`COMPRESSION_COOLDOWN`)
- If `compressionFailed` is `true`, it auto-resets to `false` after 30s, allowing retry
- All state resets on mode change or session clear

## Configuration

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `contextCompression` | `boolean` | `true` | Async LLM-based context compression |
| `compressionModel` | `string \| null` | `null` | Model override for compression (falls back to `cheapModel`, then main model) |
| `compressionRatio` | `number` | `0.5` | Target compression ratio for `PromptCompressor` |
| `compressionThreshold` | `number` | `4000` | Byte threshold for PromptCompressor on tool outputs |

## Constants

| Constant | Value | Description |
|----------|-------|-------------|
| `KEEP_TOOL_ROUNDS` | `3` | Recent tool rounds preserved during compression |
| `COMPRESSION_COOLDOWN` | `30s` | Minimum interval between compression runs |
| `MAX_TOOL_OUTPUT_LENGTH` | `8000` | Max chars per tool output after compression |
| `COMPRESS_ARGS_LENGTH` | `1000` | Tool call args length threshold for arg compression |
| `COMPRESS_CONTENT_LENGTH` | `500` | Content field length threshold for arg compression |
| Compression timeout | `30s` | Internal timeout for LLM compression call |
