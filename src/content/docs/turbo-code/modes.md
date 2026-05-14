---
title: "Modes / Agents"
---

The system has **4 modes** (agents), each with a dedicated system prompt and tool set:

| Mode | Icon | Tools | Purpose |
|------|-------|-------------|------------|
| Normal | ⚙️ | read, bash, edit, write, grep, find, ls, add_to_context, skill_shadcn | General assistant with bash |
| Plan | 📋 | read, grep, write, edit, project_inspector, add_to_context, skill_shadcn | Creates execution plans |
| Code | ⚡ | read, bash, edit, write, grep, find, ls, ask_user, update_task_progress, add_to_context, skill_shadcn | Executes plans autonomously |
| Ask | 💬 | read, bash, grep, find, ls, fetch, add_to_context, skill_shadcn | General conversation + web fetch |

## Switching Modes

- Use `/normal`, `/plan`, `/code`, or `/ask` to switch directly to a mode
- Use `/mode` to cycle in order: Normal → Plan → Code → Ask
- The current mode is displayed in the chat header

## Code Mode

Code mode is the autonomous mode that:
1. Loads a markdown plan with a checklist
2. Executes tasks sequentially
3. Has a circuit breaker (3 consecutive failures block execution)
4. Asks for confirmation on destructive operations
5. Reports progress via `update_task_progress`
