---
title: "Sistema de Agentes"
---

## Visão Geral

O turbo-cli opera com **4 agentes** (modos), cada um com system prompt próprio e um conjunto de ferramentas específicas. A troca entre modos é feita via Tab ou comando `/mode`.

Cada agente é uma classe que herda de `Agent` (ABC) e implementa `get_system_prompt()`. As ferramentas disponíveis são declaradas no dicionário `MODE_TOOLS` em `modes.py`.

## Agentes

| Modo | Ícone | Classe | Finalidade |
|------|-------|--------|------------|
| Normal | ⚙️ | `NormalAgent` | Assistente geral com bash |
| Plan | 📋 | `PlanAgent` | Planejamento com `project_inspector` (sem bash) |
| Code | ⚡ | `CodeAgent` | Execução autônoma de planos |
| Ask | 💬 | `AskAgent` | Conversa geral + fetch |

## Ferramentas por Modo

| Ferramenta | Normal | Plan | Code | Ask |
|------------|--------|------|------|-----|
| bash | ✓ | | ✓ | ✓ |
| read | ✓ | ✓ | ✓ | ✓ |
| write | ✓ | ✓ | ✓ | |
| edit | ✓ | ✓ | ✓ | |
| grep | ✓ | ✓ | ✓ | ✓ |
| find | ✓ | ✓ | ✓ | ✓ |
| ls | ✓ | | ✓ | ✓ |
| ask_user | | ✓ | ✓ | |
| fetch | | | | ✓ |
| update_task_progress | | | ✓ | |
| project_inspector | | ✓ | | |
| add_to_context | ✓ | ✓ | ✓ | |

## Modo Plan (PlanAgent)

O `PlanAgent` é responsável por **criar planos de execução**. Ele **não tem acesso ao bash** — toda exploração do projeto é feita via `project_inspector` e `read`.

### Fluxo de Perguntas

O PlanAgent usa a ferramenta `ask_user` no modo `select` para interagir com o usuário durante a fase de levantamento de requisitos:

1. **Uma pergunta por vez** — o agente nunca faz múltiplas perguntas simultaneamente
2. **Até 5 opções pré-definidas** — o usuário pode escolher um número
3. **Texto customizado** — o usuário também pode ignorar as opções e digitar sua própria resposta
4. **O plano só é criado após todas as dúvidas serem tiradas**

### AskUserDialog.select

O método `select` da classe `AskUserDialog` (em `widgets.py`) exibe as opções numeradas e aceita:

| Entrada do usuário | Resultado |
|-------------------|-----------|
| Número válido (1-N) | Retorna o texto da opção correspondente |
| Texto livre | Retorna o texto digitado (resposta customizada) |
| Enter (vazio) | Retorna `None` (cancelamento) |

## Modo Code (CodeAgent)

O `CodeAgent` executa planos de forma autônoma:
- Carrega um plano do diretório `.ai/plans/`
- Executa tarefas sequencialmente com bash
- Valida exit code de cada comando
- Usa `update_task_progress` para marcar tarefas concluídas
- Faz rollback via `git stash + reset --hard` em caso de falha

### Circuit Breaker

No modo Code, edições em arquivos fora de `allowedFiles` contam 3 strikes antes de bloquear o agente.

### Ferramenta Edit no CodeAgent

O system prompt do CodeAgent instrui o modelo a **sempre usar `startLine` e `endLine`** na ferramenta `edit`, deixando `searchBlock` vazio. Isso elimina falhas de indentação que modelos menores (como DeepSeek Flash) cometem ao replicar searchBlocks.

A descrição da ferramenta `edit` em toda a aplicação também foi padronizada para instruir o uso de `startLine`/`endLine` com `searchBlock` vazio.

### Repo Map

O CodeAgent injeta um **repo map** (mapa estrutural do projeto usando tree-sitter) no system prompt, com limite de 4000 caracteres. O PlanAgent também injeta um repo map (2000 chars, 30 arquivos). Isso elimina chamadas redundantes a `project_inspector.get_repo_map`.

## Active Files (Contexto Ativo)

Active files são arquivos cujo conteúdo é injetado diretamente no system prompt do LLM, eliminando a necessidade de chamar `read` repetidamente.

### Como funciona

1. O tool `add_to_context` (disponível nos modos NORMAL, PLAN, CODE) adiciona/remove/list arquivos
2. Arquivos adicionados são lidos do disco e anexados ao system prompt em formato XML
3. O conteúdo é reinserido a cada reconstrução do prompt (sempre fresco)
4. Quando active files mudam, `messages[0]` é reconstruído para o próximo round do LLM

### Limites

- Máximo **5 arquivos**
- Cada arquivo limitado a **5000 chars** (middle truncation)
- `add_to_context` com `operation=list` exibe os arquivos ativos

### Metadata e Prefix Caching

A metadata dos active files inclui apenas a **contagem de linhas** (`metadata: N lines`). Timestamps (`st_mtime`) e tamanho (`st_size`) foram removidos — eles invalidavam o Prefix Cache do provedor a cada edição, especialmente crítico para modelos **DeepSeek** que fazem cache automático do prefixo do system prompt. Com a metadata estabilizada, o cache hit rate em active files chega a ~100%.

### Orthogonalidade com allowedFiles

Active files ≠ allowed_files. Um arquivo pode estar em active_files (leitura no contexto) sem estar em allowed_files (permissão de edição). O CodeAgent só edita arquivos em allowed_files.

### Slash command

O comando `/add <caminho>` adiciona ao contexto ativo. `/add --remove <caminho>` remove.

## Context Pruning (Ephemeral Tool Output)

Para evitar que outputs de ferramentas acumulem e inflam o contexto, o sistema implementa pruning em dois níveis:

1. **`_compact_completed_task_history`**: quando uma tarefa do CodeAgent é concluída, remove todo o bloco de tool_calls + tool_results daquela tarefa do array de mensagens e substitui por um resumo textual (ex: `"✅ Tarefa concluída: Instalar dependências | Bash: exit 0"`)
2. **`_compact_all_tool_outputs`**: varre tool messages residuais entre tarefas não concluídas e trunca qualquer conteúdo > 200 chars com `_middle_truncate`, preservando início e fim
3. O pruning ocorre **tanto no caminho non-streaming quanto no streaming** (corrigido na v0.3+)
4. Tool messages do **round atual** nunca são truncadas

## Modo Normal (NormalAgent)

Assistente geral com acesso total a bash, leitura e escrita de arquivos. É o modo padrão ao iniciar o app.

## Modo Ask (AskAgent)

Modo de conversa geral e suporte a sistema operacional, com acesso a fetch para consultas web.

## Cache de Prompts

O sistema implementa cache em dois níveis para reduzir chamadas à API e latência:

### `_prompt_cache` (por agente)

Cada agente (NormalAgent, PlanAgent, CodeAgent, AskAgent) faz cache lazy do seu system prompt
via `get_cached_prompt()` em `agents/base.py`. O cache é populado na primeira chamada e reutilizado
enquanto o agente estiver ativo.

```python
class Agent(ABC):
    _prompt_cache: str | None = None

    def get_cached_prompt(self) -> str:
        if self._prompt_cache is None:
            self._prompt_cache = self.get_system_prompt()
        return self._prompt_cache
```

O cache pode ser invalidado via `invalidate_prompt_cache()` (disponível na classe base `Agent` desde v0.3+), útil para extensões que modificam o system prompt dinamicamente (ex: active files, refresh do repo map).

### `_tool_cache` (global por modo)

As definições de ferramentas (`get_tool_definitions` em `tools.py`) também são cacheadas por modo.
Cada modo (NORMAL, PLAN, CODE, ASK) tem seu conjunto de ferramentas, que é computado uma única
vez e reutilizado.

### `_log_cached_tokens`

O método `_log_cached_tokens` em `llm.py` loga o número de tokens em cache retornados pela API
(usando o campo `PromptTokensDetails.cached_tokens` do SDK OpenAI). Isso permite monitorar a
eficácia do cache de contexto do provedor.

## Execução Paralela de Tool Calls

O método `_process_tool_calls_batch` em `app.py` processa múltiplas tool_calls de forma otimizada:

- **Calls não-interativas** (bash simples, read, grep, find, ls) são executadas em paralelo via
  `asyncio.gather`
- **Calls interativas** (ask_user, bash destrutivo, update_task_progress com rollback) são executadas
  sequencialmente para preservar a ordem e permitir interação com o usuário
- Em caso de 2+ erros consecutivos de bash, uma mensagem de sistema é injetada para orientar o LLM

O classificador `_is_tool_interactive` determina se uma tool_call é interativa:
- `ask_user`: sempre interativo
- `bash` com comando destrutivo (`rm -rf`, `dd`, `mkfs`, etc.): interativo
- `update_task_progress action=rollback`: interativo

## Streaming no Modo CODE

O modo CODE (e também NORMAL e ASK) usa `_stream_tool_calls_from_stream` para processar
respostas da API em streaming. O fluxo é:

1. Tenta streaming via `client.stream_chat()`
2. Se streaming falhar (exceção), retorna `__FALLBACK__` para o caller usar modo tradicional
3. Durante o streaming, coleta tokens de texto e tool_calls incrementalmente
4. Chunks de `CompletionUsage` atualizam a contagem total de tokens
5. Tool_calls acumuladas são processadas via `_process_tool_calls_batch`

## Benchmark

O script `scripts/benchmark.py` mede performance do `LLMClient`:

- Executa 3 rodadas de chat_completion com ferramentas (bash, read)
- Coleta: prompt_tokens, completion_tokens, cached_tokens, latência por requisição
- Salva resultados em `scripts/benchmark-results.json` com timestamp
- Suporta `--save <label>` e `--compare <label_a> <label_b>`

Uso:
```bash
python scripts/benchmark.py --save baseline       # Antes das otimizações
python scripts/benchmark.py --save after-otimizacao  # Depois
python scripts/benchmark.py --compare baseline after-otimizacao  # Comparação
```

## LLMClient — Métricas de Performance

O `LLMClient` em `llm.py` expõe `last_request_duration` (property) que retorna o tempo
em segundos da última chamada à API, tanto para `chat_completion` quanto para `stream_chat`.
Isso permite monitoramento de latência em tempo real.

## Middle Truncation

O histórico de mensagens passa por truncamento inteligente via `_middle_truncate` em `app.py`:
- Preserva o início (60%) e o final (40%) de tool results muito longos
- Insere marcador `[... truncated: N chars ...]` no meio
- Evita perda de contexto relevante nas bordas das mensagens

## Comportamento Específico por Modelo (DeepSeek)

Modelos da família **DeepSeek** recebem otimizações automáticas quando detectados via `_is_deepseek()` no `OpenAICompatibleClient`:

| Parâmetro | DeepSeek | Outros modelos |
|-----------|----------|----------------|
| `temperature` | `0.0` (forçado) | Padrão da API (não enviado) |
| `parallel_tool_calls` | `false` (forçado) | `true` (configurável via `ConfigModel`) |

### Por quê?

- **temperature=0.0**: DeepSeek Flash tende a ser criativo demais em tool calling. Forçar temperatura zero elimina alucinações em nomes de arquivos, parâmetros e comandos bash.
- **parallel_tool_calls=false**: DeepSeek Flash frequentemente alucina parâmetros ou mistura argumentos quando invoca 3+ ferramentas simultaneamente. Execução sequencial é mais confiável.

### Ferramenta Edit

O system prompt do CodeAgent e a descrição da ferramenta `edit` instruem explicitamente o uso de `startLine`/`endLine` com `searchBlock` vazio. Modelos DeepSeek têm dificuldade em replicar indentação exata para searchBlock; o DIRECT REPLACEMENT por linhas é mais preciso.

## Arquivos Relacionados

| Arquivo | Descrição |
|---------|-----------|
| `turbo_cli/agents/base.py` | Classe base `Agent` (ABC) + cache de prompt |
| `turbo_cli/agents/normal.py` | `NormalAgent` |
| `turbo_cli/agents/plan.py` | `PlanAgent` + `PLAN_SYSTEM_PROMPT` |
| `turbo_cli/agents/code.py` | `CodeAgent` + repo_map injection |
| `turbo_cli/agents/ask.py` | `AskAgent` |
| `turbo_cli/shared/modes.py` | Enum `AgentMode`, `MODE_TOOLS`, `MODE_LABELS` |
| `turbo_cli/shared/widgets.py` | `AskUserDialog` (input, confirm, select) |
| `turbo_cli/llm.py` | `LLMClient` + `_log_cached_tokens` + timing |
| `turbo_cli/shared/tools.py` | Tool definitions (incl. `add_to_context`) + `_tool_cache` + `_validate_file_access` |
| `scripts/benchmark.py` | Script de benchmark reproduzível |
