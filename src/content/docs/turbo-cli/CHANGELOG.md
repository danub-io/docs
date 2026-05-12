---
title: "Changelog"
---

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-br/1.1.0/),
e este projeto segue o [Semantic Versioning](https://semver.org/lang/pt-BR/).

## [0.3.1] — 2026-05-11

### Corrigido
- **ANSI rendering — caracteres `?` nas cores:** Removidos `force_terminal=True` e `color_system="truecolor"` do rich; adicionada verificação `sys.__stdout__.isatty()` em `_use_ansi()` para evitar escapes ANSI em pipes
- **Layout quebrado pelo `footer_app`:** Removido o segundo `Application` do `prompt_toolkit` que executava concorrentemente e causava redraws inconsistentes e conflito de input handling
- **Spinner "Pensando..." inoperante:** Substituído placeholder vazio por animação com caracteres braille gerenciada via `asyncio.CancelledError`

### Alterado
- **`_get_console()`:** Agora usa autodetecção do rich em vez de forçar `color_system="truecolor"` — rich detecta corretamente as capacidades do terminal
- **Toolbar:** Simplificada, removido indicador "PENSANDO..." que dependia do `footer_app`
- **Imports:** Removidos 6 imports não utilizados do `prompt_toolkit` em `app.py`

### Adicionado
- **Atalhos Ctrl+C e Ctrl+V:** Copiar seleção e colar da área de transferência
- **Comandos `/end` e `/new`:** Sair e iniciar nova sessão respectivamente

### Removido
- **`--no-color` CLI flag:** Substituído por autodetecção automática via rich + TTY check

## [0.3.0] — 2026-05-11

### Adicionado
- **Entry point `turbo`:** CLI global via `pip install -e .` + `pyproject.toml`
- **`turbo_cli/cli.py`:** Argparse com `--version` e `--model`, `_check_venv()` com 3 entry points
- **`turbo_cli/__main__.py`:** Suporte a `python -m turbo_cli`
- **Documentação atualizada:** index.mdx, README.md, CHANGELOG.md, CONTRIBUTING.md, setup-local.md, architecture/README.md, tui-flow.md refletem arquitetura v0.3.0

### Alterado
- **`main.py`:** Reduzido a thin wrapper → `from turbo_cli.cli import main; main()`
- **`requirements.txt`:** Movido para dev-deps apenas (pytest, mypy), deps principais em `pyproject.toml`

## [0.2.0] — 2026-05-11

### Adicionado
- **Sistema de 4 agentes:** Normal, Plan, Code e Ask com system prompts e ferramentas dedicadas
- **Ferramenta `ask_user` no modo Plan:** Agente Plan agora pode fazer perguntas ao usuário durante o planejamento
- **Suporte a texto customizado no `AskUserDialog.select`:** Usuário pode digitar resposta livre além de escolher opções numéricas
- **Instruções de uso do `ask_user` no `PLAN_SYSTEM_PROMPT`:** Agente Plan é instruído a fazer uma pergunta por vez com até 5 opções
- **Slash commands:** `/mode`, `/plan`, `/plan-menu`, `/plan-abort`, `/code`, `/code-reset`, `/code-status`, `/help`
- **Tab cycle:** Tecla Tab alterna entre os 4 modos sequencialmente
- **Circuit breaker:** Proteção contra edições fora de arquivos permitidos no modo Code
- **ProgressWidget:** Barra de progresso visual durante execução de planos no modo Code
- **Plan writer/parser:** Geração e leitura de planos em `.ai/plans/*.md`

### Corrigido
- **Inconsistência em app.py:** Padronização de `messages[0] = {...}` para `messages.clear(); messages.append()` em todos os 4 pontos de troca de modo, eliminando risco de IndexError

## [0.1.0] — 2026-05-11

### Adicionado
- **App loop com prompt_toolkit:** Prompt inline estilo Claude Code com histórico persistente
- **LLM Client:** Streaming via SDK OpenAI, compatível com qualquer provedor OpenAI-compatible
- **Config management:** Config em `~/.config/turbo-cli/config.json` via pydantic
- **Slash commands:** `/model`, `/key`, `/clear`, `/quit`
- **Formatação rich:** Markdown com syntax highlight, painéis, feedback visual
- **Multi-line input:** Esc+Enter para nova linha, Enter para enviar
