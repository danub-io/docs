---
title: "MCP (Model Context Protocol)"
---

Turbo Code supports the **Model Context Protocol (MCP)** for integrating external tool servers. MCP servers provide additional tools that are automatically registered into the ToolRegistry.

## Architecture

```
turbo-code/
└── src/modules/mcp/
    ├── stdio-client.ts     # StdioMCPClient — spawns MCP server as subprocess
    ├── registry.ts         # MCPRegistry — manages MCP clients
    └── types.ts            # MCPClient interface
```

## Configuration

MCP servers are defined in `~/.config/turbo/mcp-servers.json`:

```json
{
  "servers": [
    {
      "name": "github",
      "command": "node",
      "args": ["/path/to/github-mcp-server/index.js"]
    },
    {
      "name": "filesystem",
      "command": "npx",
      "args": ["@modelcontextprotocol/server-filesystem", "/path/to/project"]
    }
  ]
}
```

If the file does not exist, no MCP servers are loaded.

## How It Works

1. On startup, `MCPRegistry` loads server configs from `mcp-servers.json`
2. For each server, a `StdioMCPClient` is created and spawned as a subprocess
3. The client initializes via JSON-RPC 2.0 (`initialize` handshake)
4. Tools are listed via `tools/list` and registered into the ToolRegistry with prefixed names: `mcp_<server-name>_<tool-name>`
5. Tool execution dispatches via `tools/call` JSON-RPC messages

## Tool Naming

MCP tools are registered with the prefix `mcp_<server-name>_` to avoid name collisions:

| MCP Tool Name | Registered As |
|---------------|---------------|
| `read_file` | `mcp_filesystem_read_file` |
| `search_code` | `mcp_github_search_code` |

## Timeouts

- MCP requests have a 30-second timeout
- Failed connections are logged but do not block startup

## Disconnection

On server shutdown, all MCP clients are disconnected via `shutdown` request + process kill. Pending requests are rejected with "MCP server disconnected".
