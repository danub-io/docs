---
title: 'LUPINHO — Hardware Curation Ecosystem'
---

Welcome to **LUPINHO** (TechReveal), an automated ecosystem for hardware analysis, comparison, and curation. This project leverages Artificial Intelligence and web automation to turn raw data into valuable business insights.

## Project Structure

The ecosystem is split into two main repositories that share the same **Turso (SQLite)** database.

| Repository                     | Technology                      | Role in the Ecosystem                                                |
| :----------------------------- | :------------------------------ | :------------------------------------------------------------------- |
| [**lupinho_be**](./lupinho_be) | Next.js 16+, Turso, Pino        | **Backend / Panel:** Automation (M1-M6), Scrapers, and AI Processing |
| [**lupinho_fe**](./lupinho_fe) | Astro 6+, React 19, Tailwind v4 | **Frontend / Public:** High-performance interface optimized for SEO  |

## Data Flow

```
lupinho_be (Server Actions) → Turso DB (SQLite) ← lupinho_fe (Astro SSR)
```

The **Backend** injects processed data (reviews, prices, images). The **Frontend** reads that data in real-time via Server-side Rendering (SSR).

## ADRs (Architecture Decision Records)

- **ADR-001:** Choosing Turso (distributed SQLite) as the database
- **ADR-002:** Adopting Astro Islands for the frontend
- **ADR-003:** Modular structure (Vibecoding) for AI-assisted development
- **ADR-004:** In-memory cache with stampede protection

## Documentation

| Project        | Documents                                                                                                                                                                                                      |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **lupinho_fe** | [README](./lupinho_fe/README.md), [ARCHITECTURE](./lupinho_fe/ARCHITECTURE.md), [CONTRIBUTING](./lupinho_fe/CONTRIBUTING.md), [DATA_LAYER](./lupinho_fe/DATA_LAYER.md), [CHANGELOG](./lupinho_fe/CHANGELOG.md) |
| **lupinho_be** | [README](./lupinho_be/README.md), [ARCHITECTURE](./lupinho_be/ARCHITECTURE.md), [CONTRIBUTING](./lupinho_be/CONTRIBUTING.md), [API](./lupinho_be/API.md), [CHANGELOG](./lupinho_be/CHANGELOG.md)               |
