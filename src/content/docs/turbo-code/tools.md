---
title: "Tools (15 Tools)"
---

The LLM can invoke tools to interact with the system. Each mode has access to a subset. Additionally, **skills** are registered as tools with a `skill_` prefix (e.g. `skill_shadcn`).

| Tool | Description |
|------|-------------|
| `bash` | Executes shell command (process group, timeout 30s, blocked/destructive check) |
| `read` | Reads file (offset/limit for pagination) |
| `write` | Writes file (creates directories automatically) |
| `edit` | Replaces text (startLine/endLine or oldString/newString) |
| `grep` | Searches files with regex (spawnSync, no shell injection) |
| `find` | Searches by glob pattern (spawnSync, no shell injection) |
| `ls` | Lists directory |
| `fetch` | HTTP GET with timeout |
| `ask_user` | Asks the user (input/confirm/select) |
| `add_to_context` | Manages active files injected into the system prompt |
| `project_inspector` | Explores project structure (list, tree, file_info, git) |
| `update_task_progress` | Marks task as completed in the active plan |
| `run_background` | Runs command in background with output streaming |

## Skills

In addition to the 13 core tools, **skills** are registered as tools with a `skill_` prefix. Built-in skills include `skill_shadcn` (shadcn/ui component reference) and `skill_review-pr` (PR review guidelines). Each mode includes `skill_shadcn` in its available tool set.

## Tool Security

- **Command injection prevention**: `spawnSync` with args array in grep/find (no shell)
- **Blocked commands**: 38 patterns blocked (dev servers, watchers, network listeners, etc.)
- **Destructive patterns**: 12 patterns requiring user confirmation
