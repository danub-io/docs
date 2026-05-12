---
title: "Editora CLI — Command Reference"
---



## Basic Usage

```bash
editora [COMMAND] [OPTIONS]
```

## Commands

### `init`

Creates a new book project.

```bash
editora init --title "Title" --author "Author" --output ./my-book
```

| Option | Description | Default |
|--------|-------------|---------|
| `--title` | Book title | required |
| `--author` | Author name | required |
| `--output` | Output directory | `./<title>` |

### `build`

Compiles the book to PDF and/or EPUB.

```bash
editora build                    # Generates PDF + EPUB
editora build --format pdf       # PDF only
editora build --output ./dist    # Custom directory
```

| Option | Description | Default |
|--------|-------------|---------|
| `--format` | Format: `pdf`, `epub`, `both` | `both` |
| `--output` | Output directory | `configured in editora.yaml` |

### `edit`

Edits chapters with AI.

```bash
editora edit --preview           # Preview without applying changes
editora edit --mode medium       # Apply medium-level editing
```

| Option | Description | Default |
|--------|-------------|---------|
| `--preview` | Shows diff without applying | `false` |
| `--mode` | Level: `light`, `medium`, `aggressive` | `light` |

### `proofread`

Grammar and spelling review.

```bash
editora proofread                # Review and apply corrections
editora proofread --report       # Generate report only
```

| Option | Description | Default |
|--------|-------------|---------|
| `--report` | Generates report without applying | `false` |

### `consistency`

Checks overall manuscript consistency.

```bash
editora consistency
```

### `info`

Displays project statistics (chapter count, word count, etc.).

```bash
editora info
```

### `template`

Generates a custom LaTeX typesetting template.

```bash
editora template --style modern
```

### `--version`

Displays the installed version.

```bash
editora --version
```

## Configuration (`editora.yaml`)

All behavior is controlled by the `editora.yaml` file in the project root. See the README for the full option reference.

## Web Interface

The project also includes a web interface (Next.js) in [web/](./web/). See the [README](./web/README.md) for usage and development instructions.
