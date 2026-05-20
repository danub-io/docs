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
│   │   ├── orchestrator.ts          # chatCompletionWithTools + streaming + tool loop
│   │   ├── orchestrator-loop.ts     # Main agent loop with context management
│   │   ├── planParser.ts            # Markdown plan parser
│   │   ├── context-pruner.ts        # Semantic pruning via embedding similarity
│   │   ├── contextBudget.ts         # Token budget calculation & enforcement
│   │   ├── model-router.ts          # Model selection for task routing
│   │   ├── auto-commit.ts           # Automatic git commits via LLM messages
│   │   ├── pr-builder.ts            # Auto-create PRs from improvement branches
│   │   ├── auto-merge-gate.ts       # Validate & merge PRs when gates pass
│   │   ├── early-termination.ts     # Token-level early stopping via confidence/entropy
│   │   ├── hierarchical-swarm.ts    # Multi-agent task decomposition
│   │   ├── swarm-gate.ts            # Swarm eligibility detection & orchestration
│   │   ├── decision-oracle.ts       # Self-evolution decision making
│   │   ├── improvement-tracker.ts   # Track code improvements over time
│   │   ├── experiment-registry.ts   # A/B experiment management
│   │   ├── prompt-evolver.ts        # System prompt self-improvement
│   │   ├── scaffold-generator.ts    # Generate code scaffolds from analysis
│   │   ├── self-refactorer.ts       # Autonomous code refactoring
│   │   ├── self-healer/             # Error recovery & self-healing
│   │   │   ├── self-healer.ts       # SelfHealer with error severity levels
│   │   │   ├── emergency-mode.ts    # Emergency recovery mode
│   │   │   ├── connection-watchdog.ts # Connection health monitoring
│   │   │   └── index.ts            # Failsafe system (snapshot, recovery)
│   │   └── failsafe/               # Legacy failsafe module
│   │       └── index.ts
│   ├── modules/
│   │   ├── agents/         # System prompts for the 4 modes
│   │   ├── mcp/            # MCP tool registry
│   │   ├── memory/         # MemoryStore (SQLite) + dreamer + RAG
│   │   ├── compression/    # Async LLM-based context compression
│   │   ├── providers/      # LLM Client (OpenAI-compatible)
│   │   ├── skills/         # Skills system
│   │   ├── analytics/      # Error reporting, usage tracking, self-diagnosis
│   │   │   ├── error-report.ts     # ErrorReportGenerator (daily reports)
│   │   │   ├── error-patterns.ts   # Error pattern library
│   │   │   ├── self-diagnosis.ts   # System self-diagnosis
│   │   │   ├── usage.ts            # Usage analytics
│   │   │   └── debt-tracker.ts     # Technical debt tracking
│   │   └── terminal/       # TerminalManager (node-pty)
│   ├── services/           # AppDatabase (SQLite), semantic-cache, embedder
│   ├── tools/              # 17 tool implementations + ToolRegistry
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
6. **Tools** (`src/tools/`) — 17 tools (bash, read, write, edit, grep, find, ls, fetch, ask_user, add_to_context, project_inspector, update_task_progress, run_background, git, rollback, pr, review) + skills registered as tools, executable by the LLM
7. **Auto-commit & PR** (`src/core/auto-commit.ts`, `pr-builder.ts`, `auto-merge-gate.ts`) — Post-edit auto-commit via LLM-generated messages, auto-PR creation from improvement branches, and auto-merge when CI gates pass
8. **Session** (`src/state/session.ts`) — Session state, circuit breaker, token-aware context management via a multi-layered [compression pipeline](/docs/turbo-code/compression/) (sync retroactive compression, async LLM summarization, emergency fallback, per-output compression, and distillation)
9. **Memory** (`src/modules/memory/`) — Persistent memory + RAG injection + auto-dream consolidation in background
10. **Self-Evolution Engine** (`src/core/`) — DecisionOracle, ExperimentRegistry, PromptEvolver, HierarchicalSwarm, SelfRefactorer — modules that enable the system to improve its own code, prompts, and configuration autonomously
11. **Failsafe & Self-Healing** (`src/core/failsafe/`, `src/core/self-healer/`) — Emergency mode, connection watchdog, self-healer with error severity classification, and factory reset recovery
12. **Analytics** (`src/modules/analytics/`) — ErrorReportGenerator for daily error summaries, usage tracking, technical debt tracking, and self-diagnosis

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
