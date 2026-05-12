---
title: "Fluxo do App Loop — 4 Agentes com Tool Dispatch"
---

## Visão Geral

O app loop é construído com [prompt-toolkit](https://github.com/prompt-toolkit/python-prompt-toolkit) 3.x e opera com **4 modos de agente** (Normal, Plan, Code, Ask). Cada modo tem seu próprio system prompt e conjunto de ferramentas. O fluxo principal substitui o streaming direto por um loop de **tool dispatch** (`_chat_completion_with_tools`) que permite ao LLM chamar ferramentas como bash, read, write, edit, etc.

## Componentes

```
turbo / python -m turbo_cli / python main.py
  └── cli.py: main()
        └── asyncio.run(run(initial_model, initial_provider))
              └── app.py: run()
                    ├── load_config()               ← ~/.config/turbo-cli/config.json
                    ├── ensure_api_key()             ← auto-detect provider via env var
                    ├── LLMClient(config)             ← Factory: OpenAI / Anthropic / Gemini
                    ├── agents: dict[AgentMode, Agent] ← 4 agentes instanciados
                    ├── PromptSession(history)        ← prompt_toolkit
                    ├── print_welcome()               ← rich panel
                    └── loop:
                        ├── prompt_async(">>> ")      ← aguarda input
                        ├── input.startswith("/") → _handle_slash_command()
                         │   ├── /model, /key, /provider  ← config
                         │   ├── /mode [nome]          ← troca de modo
                         │   ├── /plan <desc>          ← cria plano (PlanAgent)
                         │   ├── /plan-menu            ← lista planos
                         │   ├── /plan-abort           ← cancela planejamento
                         │   ├── /code <path>          ← executa plano (CodeAgent)
                         │   ├── /code-reset /code-status
                         │   ├── /clear                ← limpa contexto
                         │   ├── /new                  ← limpa tela e reinicia
                         │   ├── /quit /end            ← sai
                         │   └── /help                 ← ajuda
                        └── else:
                            ├── messages.append(user)
                            ├── _chat_completion_with_tools()
                            │   ├── LLM envia tool_calls ou texto + reasoning_content
                            │   ├── Se tool_calls: execute_tool() → resultado
                            │   ├── Se texto: print_response() → append
                            │   └── Máx 30 rounds de ferramentas
                            └── _check_completion()   ← PlanAgent extrai plano
```

## Fluxo Detalhado

### 1. Inicialização (`app.py:81-131`)

```python
async def run(initial_model: str | None = None) -> None:
    cfg = load_config()                      # Carrega config do disco
    if initial_model:
        cfg.model = initial_model            # --model da CLI
    ensure_api_key(cfg)                      # Pede key se vazia
    client = LLMClient(cfg)                   # SDK AsyncOpenAI

    messages = [{"role": "system",
                 "content": _system_prompt_for_mode(state.mode)}]
    state.set_messages(messages)

    session = PromptSession(history=FileHistory(...))
    print_welcome()
```

### 2. Tool Dispatch (`_chat_completion_with_tools`, linha 197)

O coração do app é um loop que alterna entre chamar o LLM e executar as tool_calls retornadas:

1. Chama `client.chat_completion(messages, tools=tools)` com as ferramentas do modo atual
2. Se o LLM retorna `tool_calls`:
   - Adiciona mensagem `assistant` com `tool_calls` ao histórico
   - Para cada tool_call, executa `execute_tool(name, params, state)`
   - Adiciona resultado como mensagem `tool`
   - Repete (máx 100 rounds)
3. Se o LLM retorna texto:
   - No modo Code: força retry até 2x para obter tool_calls
   - Exibe resposta via `print_response()` (rich Markdown)
   - Adiciona mensagem `assistant` ao histórico
   - Retorna

### 3. Troca de Modo

Shift+Tab ou `/mode` alterna entre os 4 modos:

- **Normal** ⚙️ — read, bash, edit, write, grep, find, ls
- **Plan** 📋 — read, grep, write, edit, project_inspector (sem bash)
- **Code** ⚡ — read, bash, edit, write, grep, find, ls, ask_user, update_task_progress
- **Ask** 💬 — read, bash, grep, find, ls, fetch

Cada troca limpa o histórico de mensagens e recarrega o system prompt do novo modo.

### 4. Sistema de Planos

O PlanAgent gera planos com checklist `- [ ]` e bloco JSON de metadados. Quando o LLM finaliza com "Plano concluído.":

1. `extract_and_save_plan()` salva em `.ai/plans/`
2. Menu pergunta: executar (→ CodeAgent) ou ajustar
3. CodeAgent carrega o plano e executa tarefas sequencialmente
4. `update_task_progress` marca conclusão
5. Circuit breaker (3 strikes) protege contra edições fora de `allowedFiles`

### 5. LLMClient (`turbo_cli/llm.py`)

O `LLMClient` é uma factory que instancia o cliente correto baseado no provider configurado:

| Provider | Classe | SDK | Modelos |
|----------|--------|-----|---------|
| `opencode` / `openai` / `ollama` | `OpenAICompatibleClient` | httpx (diretamente) | DeepSeek, GPT-4o, Llama, Qwen, etc. |
| `anthropic` | `AnthropicClient` | `anthropic` SDK | Claude 3/4 |
| `gemini` | `GeminiClient` | `google-generativeai` | Gemini 1.5/2.0 |

**Otimizações DeepSeek:** quando o modelo contém "deepseek" no nome, o `OpenAICompatibleClient` força `temperature=0.0` e desliga `parallel_tool_calls` para maior confiabilidade.

**Reasoning Content:** modelos DeepSeek R1 e outros modelos de raciocínio retornam `reasoning_content` separado do conteúdo principal, preservado em `UnifiedMessage.reasoning_content`.

```python
class LLMClient(BaseLLMClient):
    def __init__(self, config: ConfigModel):
        self._inner = self._build_client(config)  # Factory dispatch

    # Delega para _inner (OpenAICompatibleClient, GeminiClient ou AnthropicClient)
    async def chat_completion(self, messages, tools=None, tool_choice=None):
        return await self._inner.chat_completion(messages, tools, tool_choice)
```

### 6. Messages (`turbo_cli/messages.py`)

Usa [rich](https://github.com/Textualize/rich) para formatação:

- `print_welcome()` — Painel inicial com título
- `print_response()` — Markdown dentro de Panel
- `print_error()` / `print_info()` — Feedback visual colorido
- `show_thinking_spinner()` — Spinner animado (braille) durante tool dispatch

## Fluxo de Interação Completo

```
1. Usuário executa: turbo (ou python -m turbo_cli, python main.py)
2. cli.py: main() → asyncio.run(run())
3. app.run():
   a. Carrega config de ~/.config/turbo-cli/config.json
   b. Se API key vazia, pergunta e salva
   c. Cria LLMClient, PromptSession, instancia 4 agentes
   d. Exibe welcome
4. Loop:
   a. Mostra prompt ">>> " com toolbar (modo + modelo)
   b. Usuário digita mensagem + Enter
   c. Se "/mode code" → troca para CodeAgent
   d. Se "/plan criar um endpoint" → troca para PlanAgent
   e. Se "/plan-menu" → lista planos disponíveis
   f. Se "/code .ai/plans/meu-plano.md" → carrega e executa
   g. Se texto → _chat_completion_with_tools()
      - LLM retorna tool_calls (bash, read, write, etc.)
      - Executa cada ferramenta, retorna resultado
      - LLM processa resultado, decide próximo passo
      - Até resposta final em texto
   h. Resposta exibida com rich
5. Shift+Tab → alterna modo
```

## Layout

```
┌──────────────────────────────────────────────┐
│  turbo-cli  |  Inline LLM Assistant        │
├──────────────────────────────────────────────┤
│                                              │
│  >>> liste os arquivos do projeto             │
│                                              │
│  ┌────────────────────────────────────────┐  │
│  │  Vou usar o bash para listar.          │  │
│  │  [bash: ls -la]                        │  │
│  │  total 48                              │  │
│  │  drwxr-xr-x ... src/                   │  │
│  │  ...                                   │  │
│  └────────────────────────────────────────┘  │
│                                              │
│  >>> /plan criar README                      │
│  📋 Modo alterado para: Plan                 │
│  📄 Plano salvo em .ai/plans/plano.md        │
│                                              │
├──────────────────────────────────────────────┤
│  ⚙️ Normal | Modelo: gpt-4o | Shift+Tab     │
└──────────────────────────────────────────────┘
```

## Atalhos de Teclado

| Tecla | Ação |
|-------|------|
| Enter | Enviar mensagem |
| Esc+Enter | Nova linha no input |
| Shift+Tab | Alternar entre os 4 modos |
| Ctrl+C | Copiar seleção (quando houver seleção ativa) |
| Ctrl+V | Colar da área de transferência |

## Slash Commands

| Comando | Descrição |
|---------|-----------|
| `/model <nome>` | Trocar modelo (ex: `/model gpt-4o-mini`) |
| `/key <chave>` | Trocar API key |
| `/provider <nome>` | Trocar provedor (opencode/gemini/anthropic/ollama/openai) |
| `/mode [nome]` | Ver/trocar modo (normal/plan/code/ask) |
| `/plan <desc>` | Criar um plano automaticamente |
| `/plan-menu` | Listar e selecionar planos salvos |
| `/plan-abort` | Cancelar planejamento em andamento |
| `/code <path>` | Carregar e executar um plano |
| `/code-reset` | Resetar estado do CodeAgent |
| `/code-status` | Ver progresso do plano atual |
| `/clear` | Limpar contexto da conversa |
| `/new` | Limpar tela e iniciar nova sessão |
| `/quit` | Sair |
| `/end` | Sair (atalho) |
| `/help` | Mostrar ajuda completa |
