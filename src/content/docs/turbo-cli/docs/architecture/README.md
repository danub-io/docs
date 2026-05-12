---
title: "Arquitetura — Documentação"
---

Documentação detalhada sobre a arquitetura do turbo-cli.

## Conteúdo

- `tui-flow.md` — Fluxo do app loop com 4 agentes e tool dispatch
- `agent-system.md` — Sistema de 4 modos (Normal, Plan, Code, Ask)

## Visão Geral

O turbo-cli segue uma arquitetura em camadas com 4 agentes:

```
turbo / python -m turbo_cli / main.py
  └── cli.py → asyncio.run()
        └── app.py (loop prompt_toolkit + tool dispatch)
              ├── config.py (config + API key)
              ├── llm.py (LLMClient)
              ├── messages.py (formatação rich)
              ├── agents/ (Normal, Plan, Code, Ask)
              └── shared/ (ferramentas, estado, planos)
```

Para detalhes completos, consulte o [ARCHITECTURE.md](../ARCHITECTURE.md) na raiz.
