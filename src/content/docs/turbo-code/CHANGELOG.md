---
title: "Changelog"
---

## 0.2.0 (2026-05)

- **MCP Client** — Model Context Protocol support, auto-loads tools from external MCP servers
- **Skills System** — Skill registry with `skill_`-prefixed tools (skill_shadcn, skill_review-pr)
- **Fuzzy Edit** — Edit tool with fuzzy block matching and inline diff output
- **Diff Viewer** — Frontend component showing diffs in chat messages
- **Settings Dialog** — Frontend UI for runtime model/config changes via `POST /api/config`
- **TF-IDF Memory Search** — Weighted keyword search in MemoryStore
- **Terminal Integration** — Embedded xterm.js + node-pty with `run_background` tool and `terminal_output` event
- **Provider Config System** — Centralized provider defaults and model context windows
- **Full modularization** — `src/modules/` structure (agents, mcp, memory, providers, skills, terminal)
- **New slash commands**: `/normal`, `/plan`, `/code`, `/code-reset`, `/cancel`, `/cheap-model`, `/model`
- **Auto-.env creation** — Server creates `.env` from `.env.example` if missing
- **13 tool implementations** + skills as tools (15 total registered)

## 0.1.0 (2026-04)

- Migration from Python/Textual to TypeScript/Node.js
- Web interface with React + Vite + shadcn/ui
- 4 agent modes (Normal, Plan, Code, Ask)
- Token-by-token streaming via WebSocket
- MemoryStore with RAG injection
- Security circuit breaker
- Embedded terminal via xterm.js + node-pty
