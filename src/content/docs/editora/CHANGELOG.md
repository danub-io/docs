---
title: "Changelog"
---



Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-br/1.1.0/),
e este projeto segue o [Semantic Versioning](https://semver.org/lang/pt-BR/).

## [0.1.0] - 2026-04-15

### Adicionado

- Comando `init` para criar novos projetos de livro
- Comando `build` para compilar PDF e EPUB via Pandoc + LaTeX
- Comando `edit` com 3 níveis de copyediting (light, medium, aggressive)
- Comando `proofread` com integração LanguageTool + IA
- Comando `consistency` para verificação de personagens, timeline e tom
- Comando `info` para estatísticas do projeto
- Comando `template` para geração de templates LaTeX
- Suporte a múltiplos provedores de IA (Anthropic, OpenAI, Google, Ollama)
- Configuração via `editora.yaml` (Pydantic)
- Tipografia profissional com KDP compliance
- Detecção de duplicidade e furos na trama
- Preservação automática da voz do autor durante edição
- Testes unitários com Pytest
- CI via GitHub Actions

### Stack

- Python 3.12+
- Typer para CLI
- LangChain para orquestração de IA
- Pandoc + LaTeX para diagramação
