---
title: "Arquitetura da Editora"
---



## Visão Geral

A Editora é uma CLI Python para produção profissional de livros a partir de Markdown. O pipeline transforma capítulos brutos em PDF (print-ready) e EPUB através de um fluxo de edição com IA, revisão gramatical e diagramação.

```
chapters/*.md → [IA: Edição/Revisão] → [Pandoc + LaTeX] → output/*.pdf / *.epub
```

## Estrutura de Módulos

```
src/editora/
├── cli.py               # Interface CLI (Typer)
├── config.py            # Configurações (Pydantic + YAML)
├── core/
│   ├── manuscript.py    # Modelos Chapter e Manuscript
│   └── orchestrator.py  # Pipeline de edição
├── ai/
│   ├── llm.py           # Abstração multi-provider (Anthropic, OpenAI, Google, Ollama)
│   ├── editing.py       # Copyediting em 3 níveis (light/medium/aggressive)
│   ├── proofreading.py  # Revisão gramatical (IA + LanguageTool)
│   └── consistency.py   # Verificação de consistência (personagens, timeline, tom)
├── typesetting/
│   └── converter.py     # Pandoc → PDF/EPUB com templates LaTeX
└── utils/
    └── helpers.py       # Utilitários diversos
```

## Fluxo de Trabalho

1. **Escrita** — Capítulos em Markdown com frontmatter YAML
2. **Edição com IA** — `editora edit` aplica copyediting preservando voz do autor
3. **Proofreading** — `editora proofread` corrige gramática/ortografia (pt-BR)
4. **Consistência** — `editora consistency` detecta contradições na narrativa
5. **Build** — `editora build` gera PDF e/ou EPUB via Pandoc + LaTeX

## Provedores de IA

Suporta múltiplos provedores via camada de abstração em `ai/llm.py`:

| Provider | Variável de Ambiente | Modelo Padrão |
|----------|---------------------|---------------|
| Anthropic | `ANTHROPIC_API_KEY` | claude-sonnet-4-20250514 |
| OpenAI | `OPENAI_API_KEY` | gpt-4o |
| Google | `GOOGLE_API_KEY` | gemini-2.0-flash |
| Ollama | (local) | llama3 |

## Stack Tecnológico

- **Python 3.12+** — Linguagem principal
- **Typer** — CLI (baseada em Click)
- **Pydantic** — Validação de schemas e configurações
- **Rich** — Output colorido e tabelas no terminal
- **Pandoc** — Conversão universal de documentos
- **LaTeX (XeLaTeX)** — Diagramação profissional print-ready
- **LangChain** — Orquestração de chamadas de IA
- **LanguageTool** — Corretor gramatical open-source (pt-BR)
