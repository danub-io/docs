---
title: "Contributing to Editora"
---



Thank you for contributing! This guide defines the project's standards and workflows.

## Environment Setup

### Prerequisites

- Python 3.12+
- Pandoc ([installation](https://pandoc.org/installing.html))
- LaTeX (TeX Live, MacTeX, or [TinyTeX](https://yihui.org/tinytex/))

### Setup

```bash
git clone <repo-url>
cd editora
python -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"
```

## Code Standards

| Tool | Command | Description |
|------|---------|-------------|
| Ruff | `ruff check src/` | Linting |
| Black | `black src/` | Formatting |
| Pyright | `pyright src/` | Type checking |
| Pytest | `pytest` | Unit tests |

- **Line length**: 100 characters
- **Type hints**: Required for all public functions
- **Docstrings**: Google-style for public modules and classes

## Branch Strategy

- `main`: Main branch, always production-ready
- `feature/*`: New features
- `fix/*`: Bug fixes
- `docs/*`: Documentation improvements

## Pull Request Process

1. Create a branch from `main`
2. Make changes following the standards above
3. Run `ruff check src/ && black --check src/ && pyright src/ && pytest`
4. Open the PR against the `main` branch
5. Describe the changes and reference related issues

## Conventional Commits

```
feat: add support for custom LaTeX templates
fix: correct page size calculation in typesetter
docs: update CLI usage examples
test: add unit tests for consistency module
```
