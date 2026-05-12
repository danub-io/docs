---
title: "Editora — AI-Powered Personal Publishing Tool"
---



A **vibe coding** tool for professional book production. Write your chapters in Markdown and let Editora handle the entire publishing workflow — editing, consistency checking, typesetting, and export to PDF (print-ready) and EPUB.

## Features

- **Markdown Writing** — Easy to write, version with Git, and convert
- **AI Editing** — 3-level copyediting (light/medium/aggressive) that preserves your voice
- **Consistency Review** — Detection of contradictions, plot holes, character inconsistencies, and timeline issues
- **Proofreading** — Grammar and spelling correction (pt-BR) with LanguageTool + LLM
- **Professional Typesetting** — Print-ready PDF (KDP compliant) and EPUB via Pandoc + LaTeX
- **Intuitive CLI** — Simple commands for the entire production workflow
- **Customizable** — Templates, styles, and prompts are configurable

## Installation

### Prerequisites

- **Python 3.12+**
- **Pandoc** — [installation](https://pandoc.org/installing.html)
- **LaTeX** (for PDF) — TeX Live, MacTeX, or MiKTeX. Lightweight alternative: [TinyTeX](https://yihui.org/tinytex/)

### Install Editora

```bash
# Clone or download the project
cd editora

# Create a virtual environment (recommended)
python -m venv .venv
source .venv/bin/activate  # Linux/macOS
# or .venv\Scripts\activate  # Windows

# Install with uv (recommended) or pip
pip install -e .

# Or with dev dependencies
pip install -e ".[dev]"

# For local AI (Ollama)
pip install -e ".[local-ai]"

# For web UI
pip install -e ".[ui]"
```

### Configure AI API

Editora supports multiple providers. Set the corresponding environment variable:

```bash
# Anthropic Claude (recommended)
export ANTHROPIC_API_KEY="sk-ant-..."

# OpenAI GPT
export OPENAI_API_KEY="sk-..."

# Google Gemini
export GOOGLE_API_KEY="..."
```

Or edit the `editora.yaml` file in your project.

## Quick Start

### 1. Start a new project

```bash
editora init --title "My Book" --author "Your Name" --output my-book
cd my-book
```

This creates the structure:
```
my-book/
├── chapters/           # Chapters in Markdown
│   └── 01-first-chapter.md
├── assets/             # Images and resources
├── output/             # Generated PDF/EPUB
├── editora.yaml        # Configuration
└── README.md
```

### 2. Write chapters

Each chapter is a `.md` file with YAML frontmatter:

```markdown
---
title: The Beginning of Everything
number: 1
tags:
  - introduction
  - characters
---

# The Beginning of Everything

Once upon a time...
```

### 3. Build the book

```bash
# Generate PDF + EPUB
editora build

# PDF only
editora build --format pdf

# Custom output directory
editora build --output ./dist
```

### 4. Review with AI

```bash
# Edit chapters (preview first)
editora edit --preview --mode light

# Apply edits
editora edit --mode medium

# Grammar review
editora proofread --report

# Check consistency (characters, timeline, facts, tone)
editora consistency
```

### 5. View project info

```bash
editora info
```

## Available Commands

| Command | Description |
|---------|-------------|
| `editora init` | Creates a new book project |
| `editora build` | Compiles to PDF/EPUB |
| `editora info` | Shows project statistics |
| `editora edit` | Edits chapters with AI |
| `editora proofread` | Reviews grammar and spelling |
| `editora consistency` | Checks global consistency |
| `editora template` | Generates a typesetting template |
| `editora --version` | Shows version |

## Configuration

The `editora.yaml` file controls all behavior:

```yaml
# Book metadata
book:
  title: "My Book"
  author: "Author"
  language: "pt-BR"
  isbn: "978-0-00-000000-0"  # optional

# Typesetting
typesetting:
  format: both              # pdf, epub, both
  page_size: 6x9           # A5, 6x9, 5x8, 5.5x8.5
  font_family: Georgia
  font_size: 11
  line_height: 1.4
  margins:
    top: 2cm
    bottom: 2cm
    inner: 2.5cm
    outer: 2cm

# AI / LLM
llm:
  provider: anthropic      # openai, anthropic, google, ollama
  model: claude-sonnet-4-20250514
  temperature: 0.3
  max_tokens: 4096

# Text editing
editing:
  mode: light              # light, medium, aggressive
  preserve_voice: true
  max_changes_percent: 15.0

# Proofreading
proofreading:
  enabled: true
  language: pt-BR
  use_llm: true

# Consistency
consistency:
  enabled: true
  check_characters: true
  check_timeline: true
  check_facts: true
  check_tone: true

# Output
output:
  output_dir: output
  kdp_compliant: true
```

## Architecture

```
src/editora/
├── cli.py              # Command-line interface (Typer)
├── config.py           # Configuration (Pydantic)
├── core/
│   └── manuscript.py   # Chapter and Manuscript models
├── ai/
│   ├── llm.py          # LLM abstraction layer (multi-provider)
│   ├── editing.py      # AI copyediting
│   ├── proofreading.py # Proofreading (AI + LanguageTool)
│   └── consistency.py  # Global consistency review
├── typesetting/
│   └── converter.py    # Pandoc → PDF/EPUB
└── utils/
    └── helpers.py      # Utilities
```

## Development

```bash
# Install dev dependencies
pip install -e ".[dev]"

# Run tests
pytest

# Lint
ruff check src/

# Format
black src/

# Type check
pyright src/
```

## Suggested Workflow

1. **Write** — Create chapters in Markdown, one per file
2. **Organize** — Use numbering in filenames (`01-`, `02-`, etc.)
3. **Review consistency** — Run `editora consistency` periodically
4. **Edit with AI** — Use `editora edit --preview` to review suggestions
5. **Proofread** — Run `editora proofread` before the final version
6. **Compile** — `editora build` to generate PDF/EPUB
7. **KDP validation** — Validation is automatic during build
8. **Version** — Use Git for manuscript version control

## Web Interface

The project includes a web interface built with **Next.js 16**, React 19 and shadcn/ui. See [web/README.md](./web/README.md) for setup and development instructions.

## Technology Stack

- **Python 3.12+** — Core language
- **Typer** — CLI
- **Pydantic** — Validation and settings
- **Rich** — Formatted terminal output
- **Pandoc** — Markdown → PDF/EPUB conversion
- **LaTeX** — Professional typesetting
- **LangChain** — AI orchestration
- **LanguageTool** — pt-BR grammar checking

## License

MIT — Free to use for personal and commercial projects.

## Acknowledgments

- [Pandoc](https://pandoc.org/) — The Swiss Army knife of document conversion
- [LangChain](https://python.langchain.com/) — AI framework
- [LanguageTool](https://languagetool.org/) — Open-source grammar checker

---

*Editora — Because writing is only the beginning.*
