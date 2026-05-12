---
title: "Comandos"
---

## Execução

| Comando | Descrição |
|---------|-----------|
| `python main.py` | Executa o app |
| `python main.py -m gpt-4o` | Executa com modelo específico |
| `python main.py --model claude-sonnet-4-20250514` | Executa com modelo específico |
| `python main.py --provider anthropic` | Executa com provedor específico |
| `python main.py --version` | Exibe versão |
| `python main.py --plain` | Modo plain (sem ANSI/Unicode) |

## Dependências

| Comando | Descrição |
|---------|-----------|
| `pip install -r requirements.txt` | Instalar dependências |
| `python -m py_compile main.py` | Syntax check |

## Virtual Environment

| Comando | Descrição |
|---------|-----------|
| `python3 -m venv .venv` | Criar venv |
| `source .venv/bin/activate` | Ativar venv |
| `deactivate` | Desativar venv |

## API Key

| Método | Descrição |
|--------|-----------|
| Primeira execução | App detecta provider via env var ou menu interativo |
| Variável de ambiente (genérica) | `export TURBO_API_KEY="sk-..."` |
| Variável de ambiente (por provider) | `OPENCODE_GO_API_KEY`, `GEMINI_API_KEY`, `ANTHROPIC_API_KEY`, `OPENAI_API_KEY` |
| Comando slash | `/key sk-...` dentro do app |
| Comando slash (provedor) | `/provider opencode` para trocar de provedor |

## Instalação Global (pipx)

```bash
# Instalar via pipx (opcional)
pipx install turbo-cli

# Executar
turbo-cli

# Desinstalar
pipx uninstall turbo-cli
```

## Config Directory

```bash
# Localização
~/.config/turbo-cli/

# Arquivos
config.json    # API key, modelo, base_url
history.txt    # Histórico de comandos

# Remover config (reset)
rm -rf ~/.config/turbo-cli/
```

## Verificação de Saúde

```bash
# 1. Python instalado
python --version

# 2. Dependências instaladas
pip list | grep -E "prompt-toolkit|openai|rich|pydantic"

# 3. Config existe
test -f ~/.config/turbo-cli/config.json && echo "✓ Config OK"
```

## CLI Flags

| Flag | Descrição |
|------|-----------|
| `--version` | Exibe versão |
| `--model`, `-m` | Especificar modelo (ex: `gpt-4o`) |
| `--provider` | Especificar provedor (ex: `anthropic`, `gemini`, `opencode`) |
| `--plain` | Modo plain (sem ANSI/Unicode) |

## Comandos Slash

| Comando | Descrição |
|---------|-----------|
| `/model <nome>` | Altera o modelo LLM |
| `/key <chave>` | Altera a API key |
| `/provider <nome>` | Altera o provedor (opencode/gemini/anthropic/ollama/openai) |
| `/mode <nome>` | Troca para um modo específico (normal, plan, code, ask) |
| `/plan <descrição>` | Cria um novo plano de execução (entra no modo Plan) |
| `/plan-menu` | Lista planos salvos em `.ai/plans/` para seleção |
| `/plan-abort` | Aborta o planejamento atual e volta ao modo Normal |
| `/code <caminho-do-plano>` | Carrega um plano no modo Code para execução autônoma |
| `/code-reset` | Reseta o estado do CodeAgent |
| `/code-status` | Exibe o status atual da execução do plano |
| `/add <caminho>` | Adiciona arquivo ao contexto ativo (active files) |
| `/add --remove <caminho>` | Remove arquivo do contexto ativo |
| `/clear` | Limpa o histórico da conversa |
| `/quit` | Sai do app |
| `/end` | Sai do app (atalho) |
| `/new` | Limpa tela e inicia nova sessão |
| `/help` | Exibe a lista de comandos disponíveis |

### Atalhos de Teclado

| Tecla | Ação |
|-------|------|
| Shift+Tab | Cicla entre os modos (Normal → Plan → Code → Ask → Normal) |
| Esc + Enter | Insere nova linha no input |
| Enter | Envia mensagem |
| Ctrl+C | Copiar seleção para área de transferência |
| Ctrl+V | Colar da área de transferência |
