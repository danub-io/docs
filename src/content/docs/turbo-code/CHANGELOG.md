---
title: "Changelog"
---

## 0.4.0 (2026-05)

- **Async context compression**: replaces mechanical pruning with LLM-based semantic summarization (opt-in via `contextCompression: true`). Compresses old tool rounds and conversation history into a single `_compressed` summary using the LLM in background, zero latency added to the main loop.
- **New module** `src/modules/compression/` — `compressConversation()` function, following the same streaming pattern as the dreamer
- **New config options**: `contextCompression` (boolean, default: false), `compressionModel` (string | null, default: null — falls back to cheap model or main model)
- **Backward compatible**: legacy mechanical pruning remains the default; enabling compression replaces it entirely
- **10 new tests** for compression cutoff, shouldCompress guards, applyCompression edge cases

## 0.3.0 (2026-05)

- **Context pruning overhaul**: trigger now at 40% of context window (was "every 8 rounds"), estimator includes structural overhead (20 chars/message + 50 chars/tool_call), deduplicates stale `_pruned_history` summaries
- **Dead constants cleanup**: `KEEP_TOOL_ROUNDS` and `KEEP_LAST_MESSAGES` are now the single source of truth (imported from `constants.ts`), removing hardcoded defaults and dead exports
- **Info event accuracy**: pruning event now shows both pre- and post-pruning token counts
- **18 test files** (247 tests): added 13 new tests covering pruning trigger path, estimate tokens accuracy, edge cases (min messages, summary insertion, rounds reset, stale dedup, orchestrator trigger conditions)
- **`src/utils/symbolScanner.ts`** — new utility for symbol-level code search

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
