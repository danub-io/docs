---
title: "Postmortems — Template and Conventions"
description: "Standardized structure for recording postmortems across all projects in the ecosystem"
---

Postmortems document bugs, discoveries, and important decisions so that knowledge is not lost.

## When to create a postmortem

- Non-trivial bug whose investigation took more than 30 minutes
- Important discovery about library/framework behavior
- Architecture change or significant refactor
- Environment/infrastructure issue that may recur
- Any situation where "we learned something worth recording"

## Where to save

```
docs/src/content/docs/<project>/postmortems/POSTMORTEM-NNN-short-description.md
```

Create the `postmortems/` directory within the corresponding project if it does not exist.

## Numbering

Sequential per project. NNN is the next available number:

- `POSTMORTEM-001-...`
- `POSTMORTEM-002-...`
- `POSTMORTEM-003-...`

## File Format

```
POSTMORTEM-NNN-short-description.md
```

Example: `POSTMORTEM-003-carrossel-performance.md`

Use kebab-case, description in English, no articles.

## Template

Copy and adapt the template below:

```markdown
---
title: "Postmortem NNN: Short problem title"
---

# Postmortem NNN: Short problem title

## Sumário

- **Data:** YYYY-MM-DD
- **Componente:** `caminho/do/componente` or module description
- **Sintoma:** What was going wrong
- **Severidade:** Low / Medium / High — user impact
- **Root cause:** Root cause in 1-2 sentences

## Timeline

1. What led to the discovery
2. Investigation steps
3. Where the problem was located
4. How the fix was applied

## Root Cause

Detailed technical explanation of the root cause. Include relevant code, links, or references.

## Solução

What was done to fix it. Include before/after code blocks.

## Arquivos alterados

- `path/to/file` — description of the change

## Lições aprendidas

1. What we learned from this problem
2. What could have been done differently
3. Tips for faster debugging

## Ações preventivas

- What to do to prevent the problem from recurring
- Suggested checklists, tests, or process changes
```

## Existing examples

### ctech_fe

| # | File | Description |
|---|---------|-----------|
| 001 | `POSTMORTEM-001-select-scroll-lock` | Select dropdown causes page shrinkage on mobile |
| 002 | `POSTMORTEM-002-veredito-padding` | Inconsistent padding in the Veredito section (layout-boxed) |
| 003 | `POSTMORTEM-003-csp-hydration-block` | CSP blocking React component hydration |
| 004 | `POSTMORTEM-004-edit-tool-selfclosing-tag` | Edit tool converting self-closing JSX tag into invalid closing tag |
| 005 | `POSTMORTEM-005-hero-horizontal-scroll-padding` | HeroCarousel horizontal padding broken on ultra-wide screens |
| 006 | `POSTMORTEM-006-ssr-hooks-optimize-deps` | React Hooks error in SSR (Vite + Cloudflare Workerd) |

> **Note:** The Starlight sidebar is automatically generated from the `postmortems/` directory. Simply create a new `POSTMORTEM-NNN-description.md` file in the corresponding project directory and it will appear in the navigation without needing to edit the config.
