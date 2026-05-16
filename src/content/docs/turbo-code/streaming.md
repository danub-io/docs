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

The orchestrator uses a multi-layered context management system to keep conversation history within the model's context window. See the [Context Compression](/docs/turbo-code/compression/) page for full details.

**Compression pipeline trigger**: when estimated tokens exceed 40% of the model's context window (`PRUNE_TOKEN_RATIO`) with at least 2 tool rounds since the last intervention.

The five layers are:

1. **Retroactive sync compression** — `PromptCompressor` compresses individual tool outputs over 4000 bytes
2. **Async LLM compression** — fire-and-forget LLM call summarizes old conversation turns into a `_compressed` message
3. **Emergency fallback** — if still above 80% context, runs sync compression with halved threshold
4. **Per-output compression** — inline compression of tool outputs and tool call arguments on every round
5. **Distillation** — optional structured summary via `cheapModel` when context exceeds 50% of the window
