---
title: "Contribuindo — turbo-cli"
---

Guia de contribuição para o projeto turbo-cli.

## Pré-requisitos

- Python >= 3.12
- pip/venv

## Setup do Ambiente

```bash
# Clone
git clone <repo-url> turbo-cli
cd turbo-cli

# Criar e ativar venv
python3 -m venv .venv
source .venv/bin/activate

# Instalar dependências
pip install -r requirements.txt
```

## Boas Práticas

- **Rich Console:** ao modificar configuração do `Console` do rich, nunca forçar `force_terminal` ou `color_system` fixo — usar autodetecção (deixar rich detectar as capacidades do terminal automaticamente)
- **prompt_toolkit:** não criar um segundo `Application` concorrente; qualquer UI adicional deve usar os callbacks existentes (`bottom_toolbar`, etc.)
- **Códigos ANSI manuais:** sempre verificar `sys.__stdout__.isatty()` antes de emitir escapes ANSI diretamente

## Estrutura para Contribuição

### Entrypoints
- `main.py` — Thin wrapper → `from turbo_cli.cli import main; main()`
- `turbo_cli/cli.py` — CLI argparse (--version, --model, --plain), asyncio.run()
- `turbo_cli/__main__.py` — Suporte a `python -m turbo_cli`
- `pyproject.toml` — Build system + entry point `turbo = "turbo_cli.cli:main"`

### App (`turbo_cli/`)
- `app.py` — Loop principal prompt_toolkit, slash commands, tool dispatch (`_chat_completion_with_tools`)
- `config.py` — ConfigModel pydantic, API key, load/save
- `llm.py` — LLMClient (SDK OpenAI), streaming + chat completion
- `messages.py` — Formatação rich (markdown, panels, spinner animado com braille)

### Agentes (`turbo_cli/agents/`)
- `base.py` — Agent (ABC): modo + system prompt
- `normal.py` — NormalAgent: assistente geral com bash
- `plan.py` — PlanAgent: planejamento com project_inspector
- `code.py` — CodeAgent: executor autônomo com planos e circuit breaker
- `ask.py` — AskAgent: conversa geral + fetch

### Shared (`turbo_cli/shared/`)
- `modes.py` — AgentMode enum, MODE_TOOLS, MODE_LABELS
- `state.py` — SessionState (modo, mensagens, plano, circuit breaker)
- `tools.py` — Definições e execução de ferramentas (bash, read, write, edit, etc.)
- `ui.py` — Branding, box chars, render_progress_bar
- `widgets.py` — ProgressWidget, AskUserDialog (input/confirm/select)
- `plan_parser.py` — Parse de planos (markdown checklist + JSON metadata)
- `plan_writer.py` — Geração e extração de planos

## Fluxo de Trabalho

1. Crie uma branch a partir de `main`
2. Faça as alterações necessárias
3. Teste manualmente com `turbo` ou `python main.py`
4. Commit com mensagem descritiva
5. Abra um Pull Request

## Reportando Bugs

- Descreva o problema com passos para reproduzir
- Inclua output relevante (erros do terminal, stack trace Python)
- Informe versão do Python, modelo e provedor usado

## Licença

Ao contribuir, você concorda que suas contribuições serão licenciadas sob a MIT License.
