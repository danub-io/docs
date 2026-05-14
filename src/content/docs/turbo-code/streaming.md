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

## Context Pruning

Every 8 tool rounds, the orchestrator compacts the history:
- Removes old tool_calls, keeps the last 4 full rounds
- Preserves user context (recent user/assistant messages)
- Dynamic blocks (`<memories>`, active files) are placed at the end of the system prompt for Prefix Caching optimization
