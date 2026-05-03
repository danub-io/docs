---
title: "CLI da Editora — Referência de Comandos"
---



## Uso Básico

```bash
editora [COMANDO] [OPÇÕES]
```

## Comandos

### `init`

Cria um novo projeto de livro.

```bash
editora init --title "Título" --author "Autor" --output ./meu-livro
```

| Opção | Descrição | Padrão |
|-------|-----------|--------|
| `--title` | Título do livro | obrigatório |
| `--author` | Nome do autor | obrigatório |
| `--output` | Diretório de saída | `./<title>` |

### `build`

Compila o livro para PDF e/ou EPUB.

```bash
editora build                    # Gera PDF + EPUB
editora build --format pdf       # Apenas PDF
editora build --output ./dist    # Diretório customizado
```

| Opção | Descrição | Padrão |
|-------|-----------|--------|
| `--format` | Formato: `pdf`, `epub`, `both` | `both` |
| `--output` | Diretório de saída | `configurado no editora.yaml` |

### `edit`

Edita capítulos com IA.

```bash
editora edit --preview           # Preview sem aplicar mudanças
editora edit --mode medium       # Aplica edição nível médio
```

| Opção | Descrição | Padrão |
|-------|-----------|--------|
| `--preview` | Mostra diff sem aplicar | `false` |
| `--mode` | Nível: `light`, `medium`, `aggressive` | `light` |

### `proofread`

Revisão gramatical e ortográfica.

```bash
editora proofread                # Revisa e aplica correções
editora proofread --report       # Apenas gera relatório
```

| Opção | Descrição | Padrão |
|-------|-----------|--------|
| `--report` | Gera relatório sem aplicar | `false` |

### `consistency`

Verifica consistência global do manuscrito.

```bash
editora consistency
```

### `info`

Exibe estatísticas do projeto (contagem de capítulos, palavras, etc.).

```bash
editora info
```

### `template`

Gera template de diagramação LaTeX customizado.

```bash
editora template --style modern
```

### `--version`

Exibe a versão instalada.

```bash
editora --version
```

## Configuração (`editora.yaml`)

Todo o comportamento é controlado pelo arquivo `editora.yaml` na raiz do projeto. Veja o README para a referência completa de opções.

## Interface Web

O projeto também possui uma interface web (Next.js) em [web/](./web/). Consulte o [README](./web/README.md) para instruções de uso e desenvolvimento.
