---
title: "Architecture"
---

## Directory Structure

```
turbo-code/
├── package.json            # Backend Node.js + Express
├── tsconfig.json           # TypeScript strict mode
├── vitest.config.ts        # Vitest test runner
├── src/
│   ├── index.ts            # Entrypoint
│   ├── config/             # ConfigModel (load/save JSON)
│   ├── state/              # SessionState (messages, circuit breaker, pruning)
│   ├── core/
│   │   ├── orchestrator.ts # chatCompletionWithTools + streaming + tool loop
│   │   └── planParser.ts   # Markdown plan parser
│   ├── modules/
│   │   ├── agents/         # System prompts for the 4 modes
│   │   ├── mcp/            # MCP tool registry
│   │   ├── memory/         # MemoryStore (JSON) + dreamer + RAG
│   │   ├── compression/    # Async LLM-based context compression
│   │   ├── providers/      # LLM Client (OpenAI-compatible)
│   │   ├── skills/         # Skills system
│   │   └── terminal/       # TerminalManager (node-pty)
│   ├── tools/              # 13 tool implementations + ToolRegistry
│   ├── server/             # Express + WebSocket (/ws)
│   └── types/              # Shared types (StreamEvent, ToolDefinition, etc.)
├── web/                    # Frontend React + Vite + shadcn/ui
│   ├── src/
│   │   ├── App.tsx         # Main chat interface
│   │   ├── components/     # shadcn/ui (Button, Card, Dialog, etc.)
│   │   ├── features/       # Feature modules (chat, plan, settings, sessions)
│   │   ├── hooks/          # WebSocket hook, slash menu
│   │   ├── theme/          # Theme provider + context
│   │   ├── types/          # Frontend type definitions (chat, events)
│   │   └── lib/            # Utility functions
│   └── dist/               # Production build
└── tests/                  # Legacy tests (env, frontend build check)
```

## Layers

1. **Entrypoint** (`src/index.ts`) — Initializes Express, WebSocket, and configuration
2. **Server** (`src/server/`) — HTTP + WebSocket handler, slash commands, auto-dream background consolidation
3. **Orchestrator** (`src/core/orchestrator.ts`) — Chat loop, tool dispatch, streaming
4. **LLM Client** (`src/modules/providers/llm-client.ts`) — OpenAI-compatible API
5. **Agent Prompts** (`src/modules/agents/`) — System prompts for the 4 modes
6. **Tools** (`src/tools/`) — 13 tools + skills registered as tools, executable by the LLM
7. **Session** (`src/state/session.ts`) — Session state, circuit breaker, token-aware context management. Two strategies available:
   - **Legacy pruning** (default): mechanical truncation of old tool rounds, keeps last 3 via `KEEP_TOOL_ROUNDS`, preserves system messages + user context, deduplicates stale `_pruned_history` summaries
   - **Async compression** (opt-in via `contextCompression: true`): LLM-based semantic summarization of old conversation turns, runs asynchronously in background using the cheap model, replaces old messages with a single `_compressed` summary message
8. **Memory** (`src/modules/memory/`) — Persistent memory + RAG injection + auto-dream consolidation in background

## Frontend Architecture

```
web/src/
├── main.tsx              # React entrypoint
├── App.tsx               # Chat interface + WebSocket + streaming
├── index.css             # Tailwind + dark theme
├── data/commands.ts      # Slash command definitions
├── lib/utils.ts          # cn() utility (clsx + tailwind-merge)
├── hooks/
│   ├── useWebSocket.ts   # WebSocket hook with auto-reconnect
│   └── useSlashMenu.ts   # Slash command filtering + keyboard nav
├── theme/                # ThemeProvider + context
├── types/                # chat.ts, events.ts
├── components/
│   ├── ui/               # shadcn/ui (button, card, dialog, sheet, tabs, tooltip, command, dropdown-menu, collapsible, etc.)
│   ├── AskUserModal.tsx  # LLM-to-user interaction modal (confirm/input/select)
│   └── SlashMenu.tsx     # /-commands autocomplete popup
└── features/
    ├── chat/             # ChatHeader, ChatInput, MessageList, MessageBubble, AssistantMessage, MarkdownRenderer, SyntaxHighlighter, DiffViewer, CopyButton
    │   └── hooks/        # useStreamHandler, useAutoScroll
    ├── plan/             # PlanSelectorDialog
    ├── settings/         # SettingsDialog, DirectoryBrowser
    └── sessions/         # SessionSidebar
```
