---
title: "ADR-002: Astro Islands + React for Interactive Components"
---



**Date:** 2026-04-15
**Status:** Accepted

## Context

The CTECH frontend is a content site (reviews, guides, comparisons) with critical SEO and some interactive parts (search, drawer, collapsible). We needed a framework that:

- Delivers static HTML with maximum performance
- Has SSR for SEO
- Allows selective hydration of interactive components
- Supports React for stateful components

## Decision

We chose **Astro 6** with **Islands Architecture** as the main framework, using **React 19** only for components that require state/events.

## Alternatives Considered

| Alternative | Reason for Rejection |
|------------|-------------------|
| Next.js SPA | All JS is sent to the client, hurting performance and SEO |
| Remix | Similar to Next.js, no islands concept |
| Qwik | Smaller ecosystem, fewer integrations |
| Pure Astro (without React) | Would lose the UI component ecosystem (shadcn) |

## Consequences

- Positives: Zero JS on most pages, excellent SEO, instant loading
- Positives: React components hydrate only when needed (`client:visible`, `client:idle`)
- Negatives: Two-layer complexity (Astro + React), state not shareable between islands
- Rule: Prefer Astro for presentation, React only for unavoidable interactivity

## References

- [Astro Islands](https://docs.astro.build/en/concepts/islands/)
- `ctech_fe/docs/architecture/islands.md`
