---
title: "Architecture — MBA Lite"
---



## Overview

Static landing page (SSG) for the MBA Lite course. The design is component-based with independent sections, all pre-rendered at build time.

```
Astro Components → Static HTML → dist/
```

## Components

| Component | Description |
|-----------|-------------|
| `Header` | Top navigation with anchor links |
| `Hero` | Main section with CTA |
| `Features` | Grid of course benefits |
| `LeadCapture` | Lead capture form |
| `AuthorBio` | Author/instructor biography |
| `Footer` | Footer with links and information |

## Design System

- **Colors:** CSS variables via Tailwind v4 `@theme`
- **Typography:** Geist Variable (sans-serif)
- **Components:** shadcn/ui with Radix UI primitives

## Stack

- Astro 6 (SSG)
- React 19 (islands of interactivity)
- Tailwind CSS v4
- shadcn/ui + Radix UI
- Geist Variable font
