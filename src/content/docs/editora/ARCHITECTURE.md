---
title: "Editora Architecture"
---



## Overview

Editora is a Python CLI for professional book production from Markdown. The pipeline transforms raw chapters into PDF (print-ready) and EPUB through an AI editing workflow, grammar review, and typesetting.

```
chapters/*.md → [AI: Edit/Review] → [Pandoc + LaTeX] → output/*.pdf / *.epub
```

## Module Structure

```
src/editora/
├── cli.py               # CLI interface (Typer)
├── config.py            # Configuration (Pydantic + YAML)
├── core/
│   └── manuscript.py    # Chapter and Manuscript models
├── ai/
│   ├── llm.py           # Multi-provider abstraction (Anthropic, OpenAI, Google, Ollama)
│   ├── editing.py       # 3-level copyediting (light/medium/aggressive)
│   ├── proofreading.py  # Grammar review (AI + LanguageTool)
│   └── consistency.py   # Consistency checking (characters, timeline, tone)
├── typesetting/
│   └── converter.py     # Pandoc → PDF/EPUB with LaTeX templates
└── utils/
    └── helpers.py       # Miscellaneous utilities
```

## Workflow

1. **Writing** — Chapters in Markdown with YAML frontmatter
2. **AI Editing** — `editora edit` applies copyediting while preserving the author's voice
3. **Proofreading** — `editora proofread` corrects grammar/spelling (pt-BR)
4. **Consistency** — `editora consistency` detects narrative contradictions
5. **Build** — `editora build` generates PDF and/or EPUB via Pandoc + LaTeX

## AI Providers

Supports multiple providers via the abstraction layer in `ai/llm.py`:

| Provider | Environment Variable | Default Model |
|----------|---------------------|---------------|
| Anthropic | `ANTHROPIC_API_KEY` | claude-sonnet-4-20250514 |
| OpenAI | `OPENAI_API_KEY` | gpt-4o |
| Google | `GOOGLE_API_KEY` | gemini-2.0-flash |
| Ollama | (local) | llama3 |

## Technology Stack

- **Python 3.12+** — Core language
- **Typer** — CLI (built on Click)
- **Pydantic** — Schema and configuration validation
- **Rich** — Colored output and tables in the terminal
- **Pandoc** — Universal document conversion
- **LaTeX (XeLaTeX)** — Professional print-ready typesetting
- **LangChain** — AI call orchestration
- **LanguageTool** — Open-source grammar checker (pt-BR)
