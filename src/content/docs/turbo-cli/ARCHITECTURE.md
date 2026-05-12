---
title: "Arquitetura — turbo-cli"
---

## Visão Geral

turbo-cli é um cliente TUI inline para LLMs com sistema de múltiplos agentes, organizado em camadas:

1. **Entrypoint** (`main.py` → `cli.py`) — Script Python que inicializa config, LLM client e app loop
2. **Config** (`turbo_cli/config.py`) — Gerenciamento de API key, modelo, provedor e base_url via pydantic
3. **LLM** (`turbo_cli/llm.py`) — Cliente multi-provedor: OpenAI, Anthropic, Gemini, Ollama
4. **App Loop** (`turbo_cli/app.py`) — Loop principal com prompt_toolkit, dispatch de ferramentas, troca de modos
5. **Core** (`turbo_cli/core/orchestrator.py`) — Tool dispatch, context pruning, construção de system prompt
6. **Agentes** (`turbo_cli/agents/`) — 4 modos com system prompts e ferramentas distintas
7. **Shared** (`turbo_cli/shared/`) — Ferramentas, estado de sessão, widgets de UI

```
┌──────────────────────────────────────────────────────────────┐
│                      turbo-cli (Python)                    │
│                                                               │
│  main.py → cli.py                                             │
│    └── asyncio.run(run(initial_model))                        │
│                   │                                            │
│                   ▼                                            │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  app.py (prompt_toolkit)                                 │  │
│  │  ├── load_config()     → ~/.config/turbo-cli/         │  │
│  │  ├── ensure_api_key()  → auto-detect provider            │  │
│  │  ├── LLMClient(config) → factory multi-provider           │  │
│  │  ├── agents[4]         → Normal/Plan/Code/Ask            │  │
│  │  ├── loop: prompt → dispatcher ou chat_completion         │  │
│  │  └── idle_dream        → background memory consolidation  │  │
│  └──────────────────┬───────────────────────────────────────┘  │
│                     │                                           │
│  ┌──────────────────▼───────────────────────────────────────┐  │
│  │  core/orchestrator.py                                    │  │
│  │  ├── chat_completion_with_tools() → tool dispatch loop    │  │
│  │  ├── system_prompt_for_mode()    → prompt + context      │  │
│  │  ├── _build_code_context()       → active files + mem    │  │
│  │  └── context pruning (sliding window + summaries)        │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                               │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  llm.py (BaseLLMClient factory)                          │  │
│  │  ├── OpenAICompatibleClient → OpenAI, DeepSeek, Ollama   │  │
│  │  │   ├── _is_deepseek() → temp=0, parallel=false         │  │
│  │  ├── GeminiClient → Google Gemini (SDK nativo)           │  │
│  │  ├── AnthropicClient → Anthropic Claude (SDK nativo)     │  │
│  │  └── chat_completion() / stream_chat()                   │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                               │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  agents/                                                 │  │
│  │  ├── base.py          → Agent (ABC)                      │  │
│  │  ├── normal.py        → NormalAgent (bash geral)         │  │
│  │  ├── plan.py          → PlanAgent (planejamento)         │  │
│  │  ├── code.py          → CodeAgent (execução autônoma)    │  │
│  │  └── ask.py           → AskAgent (consulta + fetch)      │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                               │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  commands/dispatcher.py                                  │  │
│  │  └── handle_slash_command() → /model, /key, /provider..  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                               │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  memory/                                                 │  │
│  │  ├── store.py        → MemoryStore (SQLite + FTS5)       │  │
│  │  └── idle_dream.py   → Background memory consolidation   │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                               │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  shared/                                                 │  │
│  │  ├── modes.py        → AgentMode enum, MODE_TOOLS        │  │
│  │  ├── state.py        → SessionState (active files, etc)  │  │
│  │  ├── tools.py        → Ferramentas + tool registry       │  │
│  │  ├── plugin_core.py  → ToolRegistry, BaseTool, load_... │  │
│  │  ├── widgets.py      → ProgressWidget, AskUserDialog     │  │
│  │  ├── plan_parser.py  → Parse de planos                   │  │
│  │  ├── plan_writer.py  → Geração de planos                 │  │
│  │  ├── ui.py           → Branding, progress bar            │  │
│  │  ├── repo_map.py     → Repo map inteligente              │  │
│  │  ├── mcp_bridge.py   → MCP tool discovery                │  │
│  │  └── task_progress.py→ CodeAgent task tracking           │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                               │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  messages.py (rich formatação)                           │  │
│  │  ├── print_welcome() — painel inicial                    │  │
│  │  ├── print_response() — Markdown + Panel                  │  │
│  │  ├── print_error() / print_info() — feedback              │  │
│  │  └── print_streaming_chunk() — output cru                │  │
│  └──────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

## ConfigModel

Gerenciado por `turbo_cli/config.py` via pydantic `BaseModel`, salvo em `~/.config/turbo-cli/config.json`:

| Campo | Tipo | Padrão | Descrição |
|-------|------|--------|-----------|
| `api_key` | `str` | `""` | Chave da API |
| `model` | `str` | `"deepseek-v4-flash"` | Nome do modelo |
| `base_url` | `str` | `""` (auto-resolvido) | URL base da API |
| `provider` | `str` | `"opencode"` | Provedor (opencode/gemini/anthropic/ollama/openai) |
| `plain_mode` | `bool` | `false` | Modo sem ANSI/Unicode |
| `parallel_tool_calls` | `bool` | `true` | Paralelismo de tools (auto-desligado para DeepSeek) |
| `max_tool_rounds` | `int` | `30` | Máx rounds de ferramentas por requisição |
| `cheap_model` | `str` | `""` | Modelo barato para tarefas leves (idle-dream) |
| `context_window` | `int` | `128000` | Janela de contexto em tokens |

### Detecção de Provedor

O sistema detecta automaticamente o provedor baseado em variáveis de ambiente:

| Provider | Env Key | URL Padrão |
|----------|---------|------------|
| opencode | `OPENCODE_GO_API_KEY` | `https://opencode.ai/zen/go/v1` |
| gemini | `GEMINI_API_KEY` | `https://generativelanguage.googleapis.com/v1beta` |
| anthropic | `ANTHROPIC_API_KEY` | `https://api.anthropic.com/v1` |
| ollama | — (sem key) | `http://localhost:11434/v1` |
| openai | `OPENAI_API_KEY` | `https://api.openai.com/v1` |

Na primeira execução sem provider configurado, o app exibe um menu interativo de seleção. O modelo padrão é `deepseek-v4-flash` no provider `opencode`.

### Comportamento Específico por Modelo

Modelos da família **DeepSeek** recebem otimizações automáticas no `OpenAICompatibleClient`:

| Parâmetro | DeepSeek | Outros modelos |
|-----------|----------|----------------|
| `temperature` | `0.0` (forçado) | Padrão da API |
| `parallel_tool_calls` | `false` (forçado) | `true` (configurável) |

### Janela de Contexto

O sistema mantém um dicionário de janelas de contexto conhecidas (~35 modelos de 8 provedores) em `config.py:_MODEL_CONTEXT_WINDOWS`. A resolução é feita por `resolve_context_window(model_name)` com fallback fuzzy (substring match) e default de 128k tokens.

## Fluxo de Mensagens com Ferramentas

O app loop usa `chat_completion_with_tools()` em `core/orchestrator.py` para gerenciar chamadas de ferramentas:

1. Usuário envia mensagem → `messages.append({"role": "user", "content": text})`
2. `client.chat_completion(messages, tools=TOOL_DEFS[modo])` → LLM responde com texto ou `tool_calls`
3. Se `tool_calls`: executa a ferramenta, append do resultado como mensagem `tool`, repete passo 2
4. Se texto: printa resposta com rich, append como `assistant`

## Sistema de Agentes

O app possui **4 modos** (agentes), cada um com um system prompt e conjunto de ferramentas dedicado:

| Modo | Ferramentas | Finalidade |
|------|-------------|------------|
| Normal | read, bash, edit, write, grep, find, ls | Assistente geral com bash |
| Plan | read, grep, write, edit, project_inspector, ask_user | Planejamento (sem bash) |
| Code | read, bash, edit, write, grep, find, ls, ask_user, update_task_progress | Execução autônoma de planos |
| Ask | read, bash, grep, find, ls, fetch | Conversa geral + fetch |

## Estados do App Loop

| Estado | Descrição |
|--------|-----------|
| Aguardando | Prompt vazio, aguardando input |
| Processando | Streaming de resposta em andamento |
| Tool call | LLM solicitou execução de ferramenta |
| Erro | Falha na requisição (timeout, auth, quota) |

## Config Directory: ~/.config/turbo-cli/

| Arquivo | Finalidade |
|---------|-----------|
| `config.json` | API key, modelo, provedor, base_url, modo plain, paralelismo |
| `history.txt` | Histórico de comandos (prompt_toolkit) |

## Plano de Execução

Planos são salvos em `.ai/plans/*.md` com formato checklist (`- [ ]`) + comentário HTML para arquivos permitidos:

```markdown
# Título do Plano

## Objetivo
Descrição do que será feito.

## Tarefas

- [ ] Descrição clara e acionável da tarefa
- [ ] Cada tarefa deve ser pequena (5-15 linhas de código no máximo)

<!-- allowedFiles: [caminho/do/arquivo.py] -->
```

O CodeAgent carrega estes planos e executa as tarefas sequencialmente, com rollback via git em caso de falha e circuit breaker (3 strikes) para edições fora dos arquivos permitidos.
