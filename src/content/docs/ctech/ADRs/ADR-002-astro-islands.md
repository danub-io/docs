---
title: "ADR-002: Astro Islands + React para Componentes Interativos"
---



**Data:** 2026-04-15
**Status:** Aceito

## Contexto

O frontend CTECH é um site de conteúdo (reviews, guias, comparações) com SEO crítico e algumas partes interativas (busca, drawer, collapsible). Precisávamos de um framework que:

- Entregasse HTML estático com performance máxima
- Tivesse SSR para SEO
- Permitisse hidratação seletiva de componentes interativos
- Suportasse React para componentes com estado

## Decisão

Escolhemos **Astro 6** com **Islands Architecture** como framework principal, usando **React 19** apenas para componentes que exigem estado/eventos.

## Alternativas Consideradas

| Alternativa | Motivo da Rejeição |
|------------|-------------------|
| Next.js SPA | Todo o JS é enviado ao cliente, prejudicando performance e SEO |
| Remix | Similar ao Next.js, sem conceito de islands |
| Qwik | Ecossistema menor, menos integrações |
| Astro puro (sem React) | Perderia ecossistema de UI components (shadcn) |

## Consequências

- Positivas: Zero JS na maioria das páginas, SEO excelente, carregamento instantâneo
- Positivas: Componentes React hidratam só quando necessário (`client:visible`, `client:idle`)
- Negativas: Complexidade de duas camadas (Astro + React), estado não compartilhável entre islands
- Regra: Preferir Astro para apresentação, React só para interatividade inevitável

## Referências

- [Astro Islands](https://docs.astro.build/en/concepts/islands/)
- `ctech_fe/docs/architecture/islands.md`
