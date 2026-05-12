---
title: "ADR-003: Modular Structure for AI-Assisted Development"
---



**Date:** 2026-04-15
**Status:** Accepted

## Context

The project is developed with intensive AI assistance (code agents). We needed a structure that:
- Minimizes the context needed per task
- Isolates domains to prevent side effects
- Makes the code easier for AIs with limited context windows to understand

## Decision

We adopted a **modular (Vibecoding)** structure with a clear separation between `core/` (infrastructure) and `modules/` (business domains). Each module contains its own components, services, and tests.

## Structure

```
src/
├── core/       # Global infrastructure (UI, lib, layouts, types, global services)
├── modules/    # Isolated domains (home, product, guide, search, compare, community)
└── pages/      # Thin routing layer (only orchestrates data → components)
```

## Alternatives Considered

| Alternative | Reason for Rejection |
|------------|-------------------|
| Flat (everything in folders by type) | Context too large for AIs, hard to isolate changes |
| Feature-Sliced Design | Too much ceremony for the project size |
| Monolithic | Violates the vibecoding principle |

## Consequences

- Positives: AI needs only 1-2 context files per task
- Positives: Changes in one module rarely affect others
- Negatives: Occasional type duplication between modules
- Rule: `@core/*` is rarely changed — changes stay in `@modules/*`

## References

- `ctech_fe/ARCHITECTURE.md`
- `ctech_fe/AGENTS.md`
