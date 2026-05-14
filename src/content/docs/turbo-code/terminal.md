---
title: "Terminal Integration"
---

Turbo Code includes an embedded terminal system powered by **xterm.js** (frontend) and **node-pty** (backend), allowing long-running commands to execute in a real terminal visible to the user.

## Architecture

```
turbo-code/
└── src/modules/terminal/
    └── TerminalManager.ts  # Singleton — manages node-pty instance
web/src/features/terminal/
    └── TerminalPanel.tsx   # Frontend xterm.js component
```

## TerminalManager (Backend)

The `TerminalManager` is a singleton that manages a single node-pty process:

```ts
const shell = process.platform === "win32" ? "powershell.exe" : "/bin/bash";
```

**Methods:**

| Method | Description |
|--------|-------------|
| `write(data)` | Write data to the terminal |
| `writeLine(data)` | Write data + newline |
| `resize(cols, rows)` | Resize the terminal |
| `onOutput(cb)` | Subscribe to terminal output |
| `destroy()` | Kill the terminal and clean up |

## `run_background` Tool

The `run_background` tool sends commands directly to the embedded terminal, bypassing the normal bash tool restrictions on long-running commands:

```ts
RunBackgroundTool.definition = {
  name: "run_background",
  description: "Run a command in the background, visible in the user's terminal. Use for servers, watchers, and long-running commands."
};
```

This tool is ideal for:
- Starting dev servers (`npm run dev`, `vite`)
- Running file watchers (`tail -f`, `nodemon`)
- Any command that would normally be blocked by the bash tool

## TerminalPanel (Frontend)

The frontend `TerminalPanel` component uses xterm.js with the `xterm-theme` dark theme:

- Renders terminal output in real time via the `terminal_output` WebSocket event
- Supports user input via `TerminalManager.writeLine()`
- Toggle visibility via the terminal button in the chat header

## Streaming Events

Background terminal output is streamed to the frontend via:

```ts
interface StreamTerminalOutput {
  type: "terminal_output";
  data: string;  // Raw terminal output
}
```
