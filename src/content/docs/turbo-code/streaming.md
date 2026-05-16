---
title: "Streaming"
---

The backend streams token by token via WebSocket. The frontend renders in real time.

## Flow

```
Client → WebSocket /ws → Server handler → Orchestrator → LLM
                                                         ↓ tokens
Client ← WebSocket ← onEvent(token) ← ← ← ← ← ← ← ← ←
```

## WebSocket Events

| Event | Description |
|-------|-------------|
| `token` | Response text chunk |
| `tool_call` | LLM requested tool execution (status: pending/running/done/error) |
| `tool_output` | Tool execution result |
| `ask_user` | Needs user confirmation (input/confirm/select) |
| `plan_progress` | Plan progress (completed tasks / total) |
| `info` | System messages (thinking, pruning, etc.) |
| `error` | Error (timeout, API, etc.) |
| `done` | End of response with token usage |
| `reasoning` | Reasoning tokens (e.g. DeepSeek thinking) |
| `thinking_round` | LLM is thinking before tool round |
| `executing_round` | Tool round being executed |
| `server_config` | Current config sent on WebSocket connect |
| `terminal_output` | Background terminal output streaming |
| `mode_change` | Mode was changed |

## Frontend Handler

The frontend uses the `useWebSocket` hook (in `web/src/hooks/useWebSocket.ts`) which:

- Auto-reconnects with exponential backoff
- Maintains heartbeat ping/pong
- Manages event queue
- Renders streaming in real time via `useStreamHandler`

## Context Management

The orchestrator manages context when estimated tokens exceed 40% of the model's context window, with a minimum of 2 tool rounds between interventions.

### Legacy Pruning (default)

Mechanical truncation of old tool rounds:
- **Trigger**: `estimateTokens() > contextWindow * 0.4`
- **Estimator**: counts chars + structural overhead (20 chars/message + 50 chars/tool_call) divided by 4
- **Retention**: keeps the last 3 full tool rounds (configurable via `KEEP_TOOL_ROUNDS`)
- **Deduplication**: stale `_pruned_history` summaries are removed before each prune — only the latest is kept
- **Safety**: `removeOrphanedTools()` runs after prune and before every LLM call to maintain message consistency
- **Prefix Caching**: dynamic blocks (`<memories>`, `_active_files`, `_plan`) are inserted after the system message for cache efficiency

### Async Compression (opt-in)

When `contextCompression: true`, replaces pruning with LLM-based semantic summarization:
- **Trigger**: same 40% threshold + 2 round minimum
- **Process**: old messages before the last 3 tool rounds are sent to the LLM (via `compressConversation()`) with a compression prompt, running asynchronously (fire-and-forget)
- **Result**: old messages are replaced by a single `_compressed` user message containing the LLM-generated summary
- **Model**: uses `compressionModel` if set, otherwise falls back to `cheapModel`, then the main model
- **Safety**: if compression fails (timeout, empty result), `compressionFailed` flag auto-resets after a 30s cooldown
- **Cooldown**: 30s between compression runs to avoid over-compressing
- **Events**: emits `info` events with "Compressing context..." (at dispatch) and "Context compressed: ~N → ~M tokens" (on completion)
