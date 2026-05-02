---
title: "Editora - Editora Pessoal Automatizada com IA"
---



Uma ferramenta de **vibe coding** para produção profissional de livros. Escreva seus capítulos em Markdown e deixe a Editora cuidar de toda a editoração — revisão, consistência, diagramação e exportação para PDF (print-ready) e EPUB.

## ✨ Funcionalidades

- **📝 Escrita em Markdown** — Fácil de escrever, versionar com Git e converter
- **🤖 Edição com IA** — Copyediting em 3 níveis (light/medium/aggressive) preservando sua voz
- **🔍 Revisão de Consistência** — Detecção de contradições, furos na trama, inconsistências de personagens e timeline
- **✅ Proofreading** — Correção gramatical e ortográfica (pt-BR) com LanguageTool + LLM
- **📐 Typesetting Profissional** — PDF print-ready (KDP compliant) e EPUB via Pandoc + LaTeX
- **🎛️ CLI Intuitiva** — Comandos simples para todo o fluxo de produção
- **⚙️  Configurável** — Templates, estilos, prompts customizáveis

## 🚀 Instalação

### Pré-requisitos

- **Python 3.12+**
- **Pandoc** — [instalação](https://pandoc.org/installing.html)
- **LaTeX** (para PDF) — TeX Live, MacTeX ou MiKTeX. Alternativa leve: [TinyTeX](https://yihui.org/tinytex/)

### Instalar a Editora

```bash
# Clone ou baixe o projeto
cd editora

# Crie um ambiente virtual (recomendado)
python -m venv .venv
source .venv/bin/activate  # Linux/macOS
# ou .venv\Scripts\activate  # Windows

# Instale com uv (recomendado) ou pip
pip install -e .

# Ou com dependências de desenvolvimento
pip install -e ".[dev]"

# Para IA local (Ollama)
pip install -e ".[local-ai]"

# Para interface web
pip install -e ".[ui]"
```

### Configurar API de IA

A Editora suporta múltiplos providers. Defina a variável de ambiente correspondente:

```bash
# Anthropic Claude (recomendado)
export ANTHROPIC_API_KEY="sk-ant-..."

# OpenAI GPT
export OPENAI_API_KEY="sk-..."

# Google Gemini
export GOOGLE_API_KEY="..."
```

Ou edite o arquivo `editora.yaml` do seu projeto.

## 📖 Uso Rápido

### 1. Iniciar um novo projeto

```bash
editora init --title "Meu Livro" --author "Seu Nome" --output meu-livro
cd meu-livro
```

Isso cria a estrutura:
```
meu-livro/
├── chapters/           # Capítulos em Markdown
│   └── 01-primeiro-capitulo.md
├── assets/             # Imagens e recursos
├── output/             # PDF/EPUB gerados
├── editora.yaml        # Configuração
└── README.md
```

### 2. Escrever capítulos

Cada capítulo é um arquivo `.md` com frontmatter YAML:

```markdown
---
title: O Começo de Tudo
number: 1
tags:
  - introdução
  - personagens
---

# O Começo de Tudo

Era uma vez...
```

### 3. Compilar o livro

```bash
# Gera PDF + EPUB
editora build

# Apenas PDF
editora build --format pdf

# Diretório de saída customizado
editora build --output ./dist
```

### 4. Revisar com IA

```bash
# Editar capítulos (preview primeiro)
editora edit --preview --mode light

# Aplicar edições
editora edit --mode medium

# Revisão gramatical
editora proofread --report

# Verificar consistência (personagens, timeline, fatos, tom)
editora consistency
```

### 5. Ver informações do projeto

```bash
editora info
```

## 📚 Comandos Disponíveis

| Comando | Descrição |
|---------|-----------|
| `editora init` | Cria novo projeto de livro |
| `editora build` | Compila para PDF/EPUB |
| `editora info` | Mostra estatísticas do projeto |
| `editora edit` | Edita capítulos com IA |
| `editora proofread` | Revisa gramática e ortografia |
| `editora consistency` | Verifica consistência global |
| `editora template` | Gera template de diagramação |
| `editora --version` | Mostra versão |

## ⚙️  Configuração

O arquivo `editora.yaml` controla todo o comportamento:

```yaml
# Metadados do livro
book:
  title: "Meu Livro"
  author: "Autor"
  language: "pt-BR"
  isbn: "978-0-00-000000-0"  # opcional

# Diagramação
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

# IA / LLM
llm:
  provider: anthropic      # openai, anthropic, google, ollama
  model: claude-sonnet-4-20250514
  temperature: 0.3
  max_tokens: 4096

# Edição de texto
editing:
  mode: light              # light, medium, aggressive
  preserve_voice: true
  max_changes_percent: 15.0

# Proofreading
proofreading:
  enabled: true
  language: pt-BR
  use_llm: true

# Consistência
consistency:
  enabled: true
  check_characters: true
  check_timeline: true
  check_facts: true
  check_tone: true

# Saída
output:
  output_dir: output
  kdp_compliant: true
```

## 🏗️  Arquitetura

```
src/editora/
├── cli.py              # Interface de linha de comando (Typer)
├── config.py           # Configurações (Pydantic)
├── core/
│   ├── manuscript.py   # Modelos Chapter e Manuscript
│   └── orchestrator.py # Pipeline principal (em desenvolvimento)
├── ai/
│   ├── llm.py          # Camada de abstração LLM (multi-provider)
│   ├── editing.py      # Copyediting com IA
│   ├── proofreading.py # Proofreading (IA + LanguageTool)
│   └── consistency.py  # Revisão de consistência global
├── typesetting/
│   └── converter.py    # Pandoc → PDF/EPUB
└── utils/
    └── helpers.py      # Utilitários
```

## 🧪 Desenvolvimento

```bash
# Instalar dependências de dev
pip install -e ".[dev]"

# Rodar testes
pytest

# Lint
ruff check src/

# Format
black src/

# Type check
pyright src/
```

## 📝 Fluxo de Trabalho Sugerido

1. **Escreva** — Crie capítulos em Markdown, um por arquivo
2. **Organize** — Use numeração nos nomes (`01-`, `02-`, etc.)
3. **Revise consistência** — Rode `editora consistency` periodicamente
4. **Edite com IA** — Use `editora edit --preview` para revisar sugestões
5. **Proofread** — Rode `editora proofread` antes da versão final
6. **Compile** — `editora build` para gerar PDF/EPUB
7. **Valide KDP** — A validação é automática no build
8. **Versione** — Use Git para controle de versões do manuscrito

## 🛠️  Stack Tecnológico

- **Python 3.12+** — Linguagem principal
- **Typer** — CLI
- **Pydantic** — Validação e configurações
- **Rich** — Output formatado no terminal
- **Pandoc** — Conversão Markdown → PDF/EPUB
- **LaTeX** — Diagramação profissional
- **LangChain** — Orquestração de IA
- **LanguageTool** — Gramática pt-BR

## 📄 Licença

MIT — Use livremente para seus projetos pessoais e comerciais.

## 🙏 Agradecimentos

- [Pandoc](https://pandoc.org/) — O canivete suíço da conversão de documentos
- [LangChain](https://python.langchain.com/) — Framework de IA
- [LanguageTool](https://languagetool.org/) — Verificador gramatical open-source

---

*Editora — Porque escrever é só o começo.*