---
title: "Postmortem 001: Renderização ANSI corrompida e spinner inoperante"
---

# Postmortem 001: Renderização ANSI corrompida e spinner inoperante

## Sumário

- **Data:** 2026-05-11
- **Componente:** `turbo_cli/messages.py`, `turbo_cli/app.py`, `turbo_cli/cli.py`
- **Sintoma:** Caracteres `?` no terminal, escapes ANSI literais em pipes, toolbar concorrente quebrando layout, spinner "Pensando..." inoperante
- **Severidade:** Média — afetava legibilidade do output e experiência do usuário
- **Root cause:** `force_terminal=True` + `color_system="truecolor"` forçados no rich sem verificar TTY real; `footer_app` (segundo `Application` do `prompt_toolkit`) executado concorrentemente causando interferência no loop principal

## Timeline

1. Usuário reporta caracteres `?` aparecendo nas cores do terminal durante uso normal
2. Investigação revela que `_get_console()` em `messages.py` força `force_terminal=True` e `color_system="truecolor"`, impedindo o rich de detectar corretamente as capacidades do terminal
3. Descobre-se que `_use_ansi()` não verifica `sys.__stdout__.isatty()`, causando escapes ANSI literais em pipes
4. Identifica-se que o `footer_app` (segundo `Application` do `prompt_toolkit`) roda em paralelo e corrompe o layout
5. `show_thinking_spinner()` era um placeholder vazio; a intenção original era usar o toolbar para mostrar "PENSANDO..." mas a implementação concorrente falhava
6. Solução aplicada em 5 commits: autodetecção do rich, TTY check, remoção do footer_app, spinner real com braille

## Root Cause

**Camada rich:** `_get_console()` forçava `force_terminal=True` e `color_system="truecolor"` para garantir cores, mas isso impedia o rich de detectar quando o terminal não suportava truecolor ou quando o stdout não era um TTY. `_use_ansi()` também não verificava `sys.__stdout__.isatty()`.

**Camada prompt_toolkit:** O `footer_app` era um segundo `Application` do prompt_toolkit criado para exibir um footer persistente "PENSANDO..." durante tool dispatch. Como prompt_toolkit não suporta duas Applications no mesmo loop, o footer_app competia com o loop principal, causando:
- Redraws inconsistentes
- Conflito de input handling
- Layout corrompido (especialmente ao trocar de modo)

**Spinner:** `show_thinking_spinner()` e `stop_thinking_spinner()` continham apenas `pass` — o spinner nunca funcionou.

## Solução

### 1. `_use_ansi()` — Adicionar TTY detection
```python
def _use_ansi() -> bool:
    if os.environ.get("NO_COLOR"):
        return False
    if os.environ.get("TERM") == "dumb":
        return False
    if hasattr(sys, "__stdout__") and sys.__stdout__ and not sys.__stdout__.isatty():
        return False
    return True
```

### 2. `_get_console()` — Autodetecção
```python
def _get_console() -> Console:
    if not _use_ansi() or _plain_mode:
        return Console(file=sys.stdout, no_color=True, force_terminal=False, color_system=None)
    return Console(file=sys.stdout)
```

### 3. `app.py` — Remover `footer_app`
```python
state.set_thinking(True)
try:
    full_response = await _chat_completion_with_tools(...)
finally:
    state.set_thinking(False)
```

### 4. `messages.py` — Spinner real com braille
```python
_SPINNER_FRAMES = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"]

async def show_thinking_spinner() -> None:
    if is_plain():
        return
    i = 0
    try:
        while True:
            frame = _SPINNER_FRAMES[i % len(_SPINNER_FRAMES)]
            sys.stdout.write(f"\r\033[93m{frame} Pensando...\033[0m")
            sys.stdout.flush()
            i += 1
            await asyncio.sleep(0.1)
    except asyncio.CancelledError:
        sys.stdout.write("\r\033[K")
        sys.stdout.flush()
```

### 5. `cli.py` — Remover `--no-color`
Removeu-se o argumento `--no-color` e o parâmetro `no_color` de `run()` e `configure_console()`, já que a autodetecção do rich + TTY check eliminam a necessidade do flag manual.

## Arquivos alterados

- `turbo_cli/messages.py` — TTY detection em `_use_ansi()`, autodetecção em `_get_console()`, spinner real com braille
- `turbo_cli/app.py` — Remoção do `footer_app`, imports limpos (6 linhas removidas), toolbar simplificada, Ctrl+C/V, /end e /new
- `turbo_cli/cli.py` — Remoção do `--no-color` flag e parâmetro `no_color`

## Lições aprendidas

1. **Nunca force `force_terminal=True` ou `color_system` fixo no rich.** Deixe o rich fazer autodetecção — ele lida corretamente com TTY, pipes, redirecionamento e terminais sem suporte a truecolor.
2. **prompt_toolkit não suporta duas Applications concorrentes.** Qualquer UI adicional deve ser implementada dentro do mesmo loop ou via ferramentas do próprio prompt_toolkit (como `bottom_toolbar` callback).
3. **Sempre verificar `sys.__stdout__.isatty()`** antes de emitir códigos ANSI manuais. O rich faz isso automaticamente, mas código customizado precisa da verificação explícita.
4. **Spinner via `\r` + ANSI é simples e eficaz** — não precisa de biblioteca adicional. O cancelamento via `asyncio.CancelledError` permite cleanup limpo.

## Ações preventivas

- Adicionar ao guia de contribuição: "ao modificar configuração do rich, nunca forçar `force_terminal` ou `color_system` — usar autodetecção"
- Todo novo recurso de UI do prompt_toolkit deve ser validado para conflitos com o loop principal do app
- Adicionar teste de regressão para `_use_ansi()` que verifique comportamento em TTY vs pipe
