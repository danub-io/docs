---
title: "Contribuindo para a Editora"
---



Obrigado por contribuir! Este guia define os padrões e fluxos de trabalho do projeto.

## Configuração do Ambiente

### Pré-requisitos

- Python 3.12+
- Pandoc ([instalação](https://pandoc.org/installing.html))
- LaTeX (TeX Live, MacTeX ou [TinyTeX](https://yihui.org/tinytex/))

### Setup

```bash
git clone <repo-url>
cd editora
python -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"
```

## Padrões de Código

| Ferramenta | Comando | Descrição |
|------------|---------|-----------|
| Ruff | `ruff check src/` | Linting |
| Black | `black src/` | Formatação |
| Pyright | `pyright src/` | Type checking |
| Pytest | `pytest` | Testes unitários |

- **Line length**: 100 caracteres
- **Type hints**: Obrigatórios em todas as funções públicas
- **Docstrings**: Google-style para módulos e classes públicas

## Estratégia de Branches

- `main`: Branch principal, sempre pronta para produção
- `feature/*`: Novas funcionalidades
- `fix/*`: Correções de bugs
- `docs/*`: Melhorias na documentação

## Processo de Pull Request

1. Crie uma branch a partir da `main`
2. Faça as alterações seguindo os padrões acima
3. Execute `ruff check src/ && black --check src/ && pyright src/ && pytest`
4. Abra o PR para a branch `main`
5. Descreva as mudanças e referencie issues relacionadas

## Conventional Commits

```
feat: add support for custom LaTeX templates
fix: correct page size calculation in typesetter
docs: update CLI usage examples
test: add unit tests for consistency module
```
