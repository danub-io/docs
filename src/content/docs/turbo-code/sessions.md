---
title: Session Persistence
description: How sessions are saved, restored, and managed
---

Session persistence provides automatic save/restore of conversation state across reconnects, page refreshes, and browser restarts.

## Overview

- Sessions are saved automatically via debounce (1s delay after state changes)
- SQLite storage in `~/.config/turbo/data.db` (WAL mode, 64MB journal limit)
- Maximum 50 sessions (LRU eviction of oldest sessions when limit is reached)
- Session restore via WebSocket `?session=<id>` query parameter on reconnect
- `session_restore` event populates the frontend with messages, mode, tokens, active files, and plan state

## Architecture

```
SessionState → toSnapshot() → SessionStore → SqliteSessionStorage
                           ↕
WebSocket: ?session=<id> on reconnect
                           ↓
session_restore event → Frontend state (messages, mode, tokens, active files, plan tasks)
```

### Flow

1. State changes in `SessionState` trigger debounced save via `SessionStore.save()`
2. `SessionStore` serializes via `toSnapshot()` and writes to SQLite via `SqliteSessionStorage`
3. On frontend reconnect, the WebSocket URL includes `?session=<id>`
4. Server loads the snapshot from SQLite, calls `fromSnapshot()` on `SessionState`, sends `session_restore` event
5. Frontend populates messages, mode, tokens, active files, plan tasks, failsafe state

## Schema

Table `sessions` in `~/.config/turbo/data.db`:

| Column | Type | Description |
|--------|------|-------------|
| `id` | TEXT PRIMARY KEY | UUID session identifier |
| `data` | TEXT | JSON blob of `SessionSnapshot` |
| `label` | TEXT | Optional human-readable label (set via rename) |
| `created_at` | INTEGER | Unix timestamp of creation |
| `updated_at` | INTEGER | Unix timestamp of last update |

## Snapshot Fields

The `SessionSnapshot` (serialized via `toSnapshot()`) contains these fields:

| Field | Type | Description |
|-------|------|-------------|
| `v` | number | Schema version (currently 1) |
| `sessionId` | string | UUID |
| `startedAt` | number | Unix timestamp |
| `updatedAt` | number | Unix timestamp |
| `mode` | string | Agent mode (DEBUG, PLAN, CODE, ASK) |
| `messages` | MessageDict[] | Full message history (filtered: no `_memories` or `_active_files`) |
| `inputTokens` | number | Cumulative input tokens |
| `outputTokens` | number | Cumulative output tokens |
| `cacheHitTokens` | number | Cumulative cache hit tokens |
| `cacheMissTokens` | number | Cumulative cache miss tokens |
| `activeFiles` | ActiveFile[] | Active file references (path, content, added_at) |
| `currentPlan` | string \| null | Markdown plan content |
| `planTasks` | PlanTaskData[] | Plan tasks with done status |
| `completedTasks` | number | Count of completed tasks |
| `totalTasks` | number | Total task count |
| `toolRounds` | number | Number of tool execution rounds |
| `autoTitleGenerated` | boolean | Whether auto-title was generated |
| `autoTitle` | string \| null | Auto-generated title |
| `autoTitleMessageHash` | string | Hash of first user message for staleness detection |
| `failsafeStalled` | boolean | Whether session is in failsafe-stalled state |
| `label` | string | Custom label (set via rename) |

## Storage Layer

### SessionStorage Interface

Two implementations:

- **`FileSessionStorage`**: JSON files in a directory (legacy, used in tests)
- **`SqliteSessionStorage`**: SQLite database (production, default)

### SessionStore

The `SessionStore` class wraps the storage with:

- **Debounce**: Saves are debounced by 1 second to batch rapid state changes
- **Debounce interval race**: When a different session ID is detected mid-debounce, the old snapshot is flushed immediately before starting the new session's debounce
- **Error handling**: `SessionStoreError` with typed error codes (`SAVE_FAILED`, `LOAD_FAILED`, `SESSION_NOT_FOUND`, etc.)
- **Promise chain**: All saves are chained on a never-dying promise to guarantee sequential ordering
- **`flush()` / `flushSync()`**: Force immediate save (used on WebSocket close)
- **LRU eviction**: Automatically removes oldest sessions when count exceeds 50
- **Schema version check**: Warnings on version mismatch (forward compatibility)
- **Message filtering**: Automatically strips `_memories` and `_active_files` messages on load
- **Lookup by label**: `load()` falls back to `loadByLabel()` if the primary lookup returns null

## Frontend Restore

### Streaming Handler

The `useStreamHandler` hook handles the `session_restore` event:

```typescript
case "session_restore": {
  const msgs = restoreMessages(event.messages, event.sessionId);
  setMessages(() => msgs);
  setMode(event.mode);
  setInputTokens(() => event.inputTokens);
  setOutputTokens(() => event.outputTokens);
  setCacheHitTokens(() => event.cacheHitTokens);
  setCacheMissTokens(() => event.cacheMissTokens);
  setCompletedTasks?.(event.completedTasks);
  setTotalTasks?.(event.totalTasks);
  if (setCurrentPlan) setCurrentPlan(event.currentPlan ?? null);
  options.setActiveFiles?.(event.activeFiles ?? []);
  options.setPlanTasks?.(event.planTasks ?? []);
  options.setFailsafeStalled?.(event.failsafeStalled ?? false);
  break;
}
```

`restoreMessages()` filters out system messages and `_memories`/`_active_files` entries, and wires tool outputs back to their corresponding tool calls.

### WebSocket URL Parameter

```
ws://localhost:3001/ws?session=<session-id>
```

- Frontend calls `wsSetSessionId(id)` → WebSocket reconnects with session parameter
- Server loads snapshot from SQLite, sends `session_restore` + `server_config`
- On invalid session ID, server sends error + `session_reset` to start fresh

## Failsafe Integration

When a failsafe checkpoint exists for a session:

1. Server loads the snapshot as usual
2. Check if failsafe checkpoint exists via `failsafe.loadLatestCheckpoint()`
3. If checkpoint found, `restoreState` is called with `failsafeStalled: true`
4. `failsafe_stall` event is sent to show recovery prompt
5. User types `continue` to trigger failsafe recovery

## Troubleshooting

### Schema Version Mismatch

When loading a session with a different schema version than the current codebase:

```
Session schema version mismatch: 999 != 1
```

This is a warning only — the session is still loaded for forward compatibility.

### Session Not Found

When an invalid session ID is requested, a new session is started automatically:

```
Session "invalid-id" could not be restored. Starting a new session.
```

### Corrupted Data

Corruption in SQLite is handled by WAL mode auto-recovery. If the database file itself is corrupted, the app creates a fresh database and logs an error.

### Eviction

When session count exceeds 50 (the maximum), the oldest sessions (by `updatedAt`) are automatically removed. This is checked after every save via `evictOld()`.

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/sessions` | List sessions (optional `?q=` for search) |
| `GET` | `/api/sessions/:id` | Get single session details |
| `DELETE` | `/api/sessions/:id` | Delete a session |
| `POST` | `/api/sessions/:id/rename` | Rename a session |
