---
title: "Terminal Integration"
---

Turbo Code includes a background terminal engine powered by **node-pty** (backend) for executing long-running commands. The terminal runs as a backend-only process — there is no visible terminal UI in the frontend.

## Architecture

```
turbo-code/
└── src/modules/terminal/
    └── TerminalManager.ts  # Singleton — manages node-pty instance
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

## Terminal Output Streaming

Terminal output is streamed to the frontend via the `terminal_output` WebSocket event, but there is no visible terminal UI. The terminal engine exists solely as a backend process manager for long-running commands via the `run_background` tool.

## Streaming Events

Background terminal output is streamed via:

```ts
interface StreamTerminalOutput {
  type: "terminal_output";
  data: string;  // Raw terminal output
}
```
