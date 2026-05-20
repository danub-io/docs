---
title: "Modes / Agents"
---

The system has **4 modes** (agents), each with a dedicated system prompt and tool set:

| Mode | Icon | Tools | Purpose |
|------|-------|-------------|------------|
| Debug | 🔍 | read, grep, project_inspector, write, ask_user, add_to_context, find, ls, **git**, **rollback** | Audits completed plans with git history inspection |
| Plan | 📋 | read, grep, project_inspector, write, edit, add_to_context, skill_shadcn, ask_user, **git** | Creates execution plans with branch awareness |
| Code | ⚡ | read, bash, edit, write, grep, find, ls, ask_user, update_task_progress, add_to_context, run_background, skill_shadcn, **git**, **rollback**, **pr**, **review** | Executes plans autonomously with full version control |
| Ask | 💬 | read, bash, grep, find, ls, fetch, add_to_context, **git** | General conversation + web fetch + git status |

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
