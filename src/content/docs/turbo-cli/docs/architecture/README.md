---
title: "Architecture — Documentation"
---

Detailed documentation about the turbo-cli architecture.

## Contents

- `tui-flow.md` — App loop flow with 4 agents and tool dispatch
- `agent-system.md` — 4-mode system (Normal, Plan, Code, Ask)

## Overview

turbo-cli follows a layered architecture with 4 agents:

```
turbo / python -m turbo_cli / main.py
  └── cli.py → asyncio.run()
        └── app.py (prompt_toolkit loop + tool dispatch)
              ├── config.py (config + API key)
              ├── llm.py (LLMClient)
              ├── messages.py (rich formatting)
              ├── agents/ (Normal, Plan, Code, Ask)
              └── shared/ (tools, state, plans)
```

For full details, see [ARCHITECTURE.md](../ARCHITECTURE.md) in the root.
