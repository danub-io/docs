---
title: "Changelog"
---



All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-04-15

### Added

- `init` command to create new book projects
- `build` command to compile PDF and EPUB via Pandoc + LaTeX
- `edit` command with 3 levels of copyediting (light, medium, aggressive)
- `proofread` command with LanguageTool + AI integration
- `consistency` command for character, timeline, and tone checking
- `info` command for project statistics
- `template` command for generating LaTeX templates
- Support for multiple AI providers (Anthropic, OpenAI, Google, Ollama)
- Configuration via `editora.yaml` (Pydantic)
- Professional typography with KDP compliance
- Detection of duplicate content and plot holes
- Automatic preservation of author's voice during editing
- Unit tests with Pytest
- CI via GitHub Actions

### Stack

- Python 3.12+
- Typer for CLI
- LangChain for AI orchestration
- Pandoc + LaTeX for typesetting
