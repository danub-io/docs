---
title: "Postmortems — Template e Convenções"
description: "Estrutura padronizada para registro de postmortems em todos os projetos do ecossistema"
---

Postmortems documentam bugs, descobertas e decisões importantes para que o conhecimento não se perca.

## Quando criar um postmortem

- Bug não trivial cuja investigação consumiu mais de 30min
- Descoberta importante sobre comportamento de biblioteca/framework
- Mudança de arquitetura ou refactor significativo
- Problema de ambiente/infraestrutura que pode se repetir
- Qualquer situação onde "aprendemos algo que vale registrar"

## Onde salvar

```
docs/src/content/docs/<projeto>/postmortems/POSTMORTEM-NNN-descricao-curta.md
```

Criar o diretório `postmortems/` dentro do projeto correspondente se não existir.

## Numeração

Sequencial por projeto. O NNN é o próximo número disponível:

- `POSTMORTEM-001-...`
- `POSTMORTEM-002-...`
- `POSTMORTEM-003-...`

## Formato do Arquivo

```
POSTMORTEM-NNN-descricao-curta.md
```

Exemplo: `POSTMORTEM-003-carrossel-performance.md`

Usar kebab-case, descrição em português, sem artigos.

## Template

Copie e adapte o template abaixo:

```markdown
---
title: "Postmortem NNN: Título curto do problema"
---

# Postmortem NNN: Título curto do problema

## Sumário

- **Data:** YYYY-MM-DD
- **Componente:** `caminho/do/componente` ou descrição do módulo
- **Sintoma:** O que acontecia de errado
- **Severidade:** Baixa / Média / Alta — impacto no usuário
- **Root cause:** Causa raiz em 1-2 frases

## Timeline

1. O que levou à descoberta
2. Passos da investigação
3. Onde o problema foi localizado
4. Como a solução foi aplicada

## Root Cause

Explicação técnica detalhada da causa raiz. Inclua código, links ou referências relevantes.

## Solução

O que foi feito para corrigir. Inclua blocos de código antes/depois.

## Arquivos alterados

- `caminho/do/arquivo` — descrição da alteração

## Lições aprendidas

1. O que aprendemos com este problema
2. O que poderia ter sido feito diferente
3. Dicas para debug mais rápido

## Ações preventivas

- O que fazer para evitar que o problema se repita
- Checklists, testes, ou alterações de processo sugeridas
```

## Exemplos existentes

### ctech_fe

| # | Arquivo | Descrição |
|---|---------|-----------|
| 001 | `POSTMORTEM-001-select-scroll-lock` | Select dropdown causa encolhimento da página no mobile |
| 002 | `POSTMORTEM-002-veredito-padding` | Padding inconsistente na seção Veredito (layout-boxed) |
| 003 | `POSTMORTEM-003-csp-hydration-block` | CSP bloqueando hidratação de componentes React |
| 004 | `POSTMORTEM-004-edit-tool-selfclosing-tag` | Edit tool convertendo self-closing JSX tag em closing tag inválida |
| 005 | `POSTMORTEM-005-hero-horizontal-scroll-padding` | Padding horizontal do HeroCarousel quebrado em telas ultra-wide |
| 006 | `POSTMORTEM-006-ssr-hooks-optimize-deps` | Erro de Hooks React no SSR (Vite + Cloudflare Workerd) |

> **Nota:** A sidebar do Starlight é gerada automaticamente a partir do diretório `postmortems/`. Basta criar um novo arquivo `POSTMORTEM-NNN-descricao.md` no diretório do projeto correspondente que ele aparece na navegação sem precisar editar config.
