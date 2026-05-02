---
title: "Arquitetura do MBA Lite"
---



## Visão Geral

Landing page estática (SSG) para o curso MBA Lite. O design é componentizado com seções independentes, todas pré-renderizadas no build.

```
Astro Components → HTML estático → dist/
```

## Componentes

| Componente | Descrição |
|------------|-----------|
| `Header` | Navegação superior com links âncora |
| `Hero` | Seção principal com CTA |
| `Features` | Grid de benefícios do curso |
| `LeadCapture` | Formulário de captura de leads |
| `AuthorBio` | Biografia do autor/instrutor |
| `Footer` | Rodapé com links e informações |

## Design System

- **Cores:** Variáveis CSS via `@theme` do Tailwind v4
- **Tipografia:** Geist Variable (sans-serif)
- **Componentes:** shadcn/ui (base-nova) com Base UI primitives

## Stack

- Astro 6 (SSG)
- React 19 (ilhas de interatividade)
- Tailwind CSS v4
- shadcn/ui (base-nova) + Base UI
- Geist Variable font
