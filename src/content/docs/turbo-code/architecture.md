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
│   │   ├── providers/      # LLM Client (OpenAI-compatible)
│   │   ├── skills/         # Skills system
│   │   └── terminal/       # TerminalManager (xterm.js + node-pty)
│   ├── tools/              # 13 tool implementations + ToolRegistry
│   ├── server/             # Express + WebSocket (/ws)
│   └── types/              # Shared types (StreamEvent, ToolDefinition, etc.)
├── web/                    # Frontend React + Vite + shadcn/ui
│   ├── src/
│   │   ├── App.tsx         # Main chat interface
│   │   ├── components/     # shadcn/ui (Button, Card, Dialog, etc.)
│   │   ├── features/       # Feature modules (chat, plan, settings, terminal)
│   │   ├── hooks/          # WebSocket hook
│   │   ├── theme/          # Theme provider + context
│   │   ├── types/          # Frontend type definitions
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
7. **Session** (`src/state/session.ts`) — Session state, circuit breaker, context pruning (every 8 tool rounds, keeps last 4 full rounds, preserves user context)
8. **Memory** (`src/modules/memory/`) — Persistent memory + RAG injection + auto-dream consolidation in background

## Frontend Architecture

```
web/src/
├── main.tsx              # React entrypoint
├── App.tsx               # Chat interface + WebSocket + streaming
├── index.css             # Tailwind + dark theme
├── lib/utils.ts          # cn() utility (clsx + tailwind-merge)
├── hooks/useWebSocket.ts # WebSocket hook with auto-reconnect
├── theme/                # ThemeProvider + context
├── types/                # chat.ts, events.ts
├── components/
│   ├── ui/               # shadcn/ui (button, card, dialog, etc.)
│   ├── AskUserModal.tsx  # Confirmation modal
│   ├── SlashMenu.tsx     # /commands autocomplete
│   └── PlanProgressBar.tsx
└── features/
    ├── chat/             # ChatHeader, ChatInput, MessageList, etc.
    ├── plan/             # PlanProgressBar, index
    ├── settings/         # SettingsDialog
    └── terminal/         # TerminalPanel (embedded xterm.js)
```
