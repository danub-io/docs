---
title: "Setup do Ambiente Local"
---

## Pré-requisitos

- **Python** >= 3.12 — [Download](https://python.org/)
- **pip** e **venv** (incluídos no Python)

## Setup

```bash
# 1. Clone o repositório
git clone <repo-url> turbo-cli
cd turbo-cli

# 2. Criar e ativar virtual environment
python3 -m venv .venv
source .venv/bin/activate

# 3. Instalar dependências
pip install -e .

# 4. Executar localmente (3 formas equivalentes)
turbo
# python -m turbo_cli
# python main.py
```

## API Key

Na primeira execução, o app pedirá a API key. Você também pode:

- Definir a env var `TURBO_API_KEY` antes de executar
- Copiar `.env.example` para `.env` e preencher

```bash
export TURBO_API_KEY="sua-chave-aqui"
turbo
```

## Verificação

```bash
# Verificar instalação
turbo --version  # ou python main.py --version

# Verificar config
cat ~/.config/turbo-cli/config.json

# Verificar histórico
cat ~/.config/turbo-cli/history.txt
```

## Estrutura de Desenvolvimento

```
turbo-cli/
├── main.py                  # Entrypoint thin (→ cli.py)
├── cli.py                   # CLI argparse + asyncio.run()
├── pyproject.toml           # Build system + entry point "turbo"
├── requirements.txt         # Dev-deps (pytest, mypy)
├── .env.example
├── turbo_cli/
│   ├── __init__.py          # __version__
│   ├── __main__.py          # python -m turbo_cli
│   ├── app.py               # Loop principal + tool dispatch
│   ├── config.py            # Config + API key
│   ├── llm.py               # LLM client
│   ├── messages.py          # Formatação rich
│   ├── shared/              # Estado, ferramentas, planos
│   │   ├── modes.py
│   │   ├── state.py
│   │   ├── tools.py
│   │   ├── widgets.py
│   │   ├── plan_parser.py
│   │   └── plan_writer.py
│   └── agents/              # 4 agentes
│       ├── base.py
│       ├── normal.py
│       ├── plan.py
│       ├── code.py
│       └── ask.py
```

## Comandos Úteis

```bash
# Python
turbo                          # Executar (entry point global)
python -m turbo_cli          # Executar via módulo
python main.py                  # Executar via script
turbo --version                # Ver versão
turbo --plain                  # Modo plain (sem ANSI/Unicode)

# Type checking
python -m mypy turbo_cli/ tests/

# Dependências
pip install -e .                # Instalar em modo editável
pip install -r requirements.txt # Dev-deps
```
