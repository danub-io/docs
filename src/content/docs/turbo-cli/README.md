---
title: "turbo-cli — Inline LLM Assistant CLI"
---

Assistente inline de terminal (estilo Claude Code) com **4 modos de agente** para conversar com modelos LLM via API, construído com Python e [prompt-toolkit](https://github.com/prompt-toolkit/python-prompt-toolkit).

## Funcionalidades

- 🧠 **4 modos de agente:** Normal (bash geral), Plan (planejamento), Code (execução autônoma), Ask (conversa + fetch)
- 🏆 **Multi-provedor:** OpenAI, Anthropic, Google Gemini, Ollama, e qualquer API OpenAI-compatible
- ⚡ **DeepSeek otimizado:** Modelo padrão (`deepseek-v4-flash`) com `temperature=0.0`, `parallel_tool_calls=false`, e 100% de Prefix Cache hit em active files
- 📝 Input multi-line (Esc+Enter para nova linha, Enter para enviar)
- ⚡ Streaming em tempo real das respostas
- 📋 Formatação markdown com syntax highlight (rich)
- ⌨️ 15 comandos slash (`/model`, `/key`, `/mode`, `/provider`, `/plan`, `/plan-menu`, `/plan-abort`, `/code`, `/code-reset`, `/code-status`, `/clear`, `/new`, `/quit`, `/end`, `/help`)
- 🔄 Compatível com qualquer API OpenAI-compatible (OpenAI, Anthropic, DeepSeek, Google Gemini, Ollama, Groq, Together, etc.)
- 💾 Histórico de comandos persistente
- ⚙️ Config em `~/.config/turbo-cli/config.json` (pydantic)
- 🔒 Circuit breaker no modo Code (proteção contra edições fora de arquivos permitidos)
- 📋 Sistema de planos com checklist + comentário HTML (sem JSON metadata)
- 📁 Active files: até 5 arquivos em contexto inline via `add_to_context` tool ou `/add`
- ✂️ Context pruning automático (ephemeral tool outputs) — redução de até 80% de tokens

## Tecnologias

- **UI:** prompt-toolkit 3.x (Textual 8.x na branch tui-textual)
- **Linguagem:** Python 3.12+
- **LLM:** SDK multi-provedor próprio (`OpenAICompatibleClient`, `AnthropicClient`, `GeminiClient`)
- **Formatação:** rich 13.x (markdown, syntax highlight)
- **Config:** pydantic 2.x

## Instalação

### Via pip install -e . (recomendado)

```bash
git clone <repo-url> turbo-cli
cd turbo-cli

python3 -m venv .venv
source .venv/bin/activate
pip install -e .

# Executar
turbo
```

### Alternativas de execução

```bash
# Após pip install -e .
turbo

# Via python -m
python -m turbo_cli

# Via main.py
python main.py
```

## Uso

```bash
# Ativar venv e iniciar
source .venv/bin/activate
turbo
```

### Comandos Slash

| Comando | Descrição |
|---------|-----------|
| `/model <nome>` | Trocar modelo (ex: `/model gpt-4o-mini`) |
| `/key <chave>` | Trocar API key |
| `/mode [nome]` | Ver/trocar modo (normal/plan/code/ask) |
| `/provider [nome]` | Ver/trocar provedor (opencode/gemini/anthropic/ollama/openai) |
| `/plan <desc>` | Criar um plano automaticamente |
| `/plan-menu` | Listar e selecionar planos salvos |
| `/plan-abort` | Cancelar planejamento em andamento |
| `/code <path>` | Carregar e executar um plano |
| `/code-reset` | Resetar estado do CodeAgent |
| `/code-status` | Ver progresso do plano atual |
| `/add <path>` | Adicionar arquivo ao contexto ativo |
| `/add --remove <path>` | Remover arquivo do contexto ativo |
| `/clear` | Limpar contexto da conversa |
| `/new` | Limpar tela e iniciar nova sessão |
| `/quit` | Sair |
| `/end` | Sair (atalho) |
| `/help` | Mostrar ajuda completa |

### Atalhos de Teclado

| Tecla | Ação |
|-------|------|
| Enter | Enviar mensagem |
| Esc+Enter | Nova linha no input |
| Shift+Tab | Alternar entre os 4 modos |
| Ctrl+C | Copiar seleção (quando houver seleção ativa) |
| Ctrl+V | Colar da área de transferência |

## Estrutura do Projeto

```
turbo-cli/
├── main.py                  # Entrypoint thin (→ cli.py)
├── cli.py                   # CLI argparse + asyncio.run()
├── pyproject.toml           # Build system + entry point "turbo"
├── requirements.txt         # Dev-deps (pytest, mypy)
├── .env.example             # Template para API key
├── turbo_cli/
│   ├── __init__.py          # __version__
│   ├── __main__.py          # python -m turbo_cli
│   ├── app.py               # Loop principal (prompt_toolkit)
│   ├── cli.py               # CLI argparse + asyncio.run()
│   ├── config.py            # ConfigModel (pydantic)
│   ├── llm.py               # LLMClient multi-provedor (OpenAI, Anthropic, Gemini)
│   ├── messages.py          # Formatação rich
│   ├── commands/
│   │   └── dispatcher.py    # Slash commands dispatch
│   ├── core/
│   │   └── orchestrator.py  # Tool dispatch, context pruning, system prompt
│   ├── memory/
│   │   ├── store.py         # MemoryStore (SQLite + FTS5)
│   │   └── idle_dream.py    # Idle-dream background consolidation
│   ├── shared/
│   │   ├── modes.py         # AgentMode enum + MODE_TOOLS
│   │   ├── state.py         # SessionState
│   │   ├── tools.py         # Ferramentas (bash, read, write, edit, etc.)
│   │   ├── plugin_core.py   # ToolRegistry, BaseTool
│   │   ├── ui.py            # Branding, progress bar
│   │   ├── widgets.py       # ProgressWidget, AskUserDialog
│   │   ├── plan_parser.py   # Parse de planos (.md → tasks)
│   │   ├── plan_writer.py   # Geração de planos
│   │   ├── repo_map.py      # Repo map inteligente
│   │   ├── mcp_bridge.py    # MCP tool discovery
│   │   └── task_progress.py # CodeAgent task tracking
│   └── agents/
│       ├── base.py          # Agent (ABC)
│       ├── normal.py        # NormalAgent
│       ├── plan.py          # PlanAgent
│       ├── code.py          # CodeAgent (execução autônoma)
│       └── ask.py           # AskAgent
```

## Licença

MIT
