---
title: "tribarato — Hardware Curation Ecosystem"
---

Welcome to **tribarato** (TechReveal), an automated ecosystem for hardware analysis, comparison, and curation. This project leverages Artificial Intelligence and web automation to turn raw data into valuable business insights.

## Project Structure

The ecosystem is split into two main repositories that share the same **Turso (SQLite)** database.

| Repository | Technology | Role in the Ecosystem |
| :--- | :--- | :--- |
| [**tribarato_be**](./tribarato_be) | Next.js 16+, Turso, Pino | **Backend / Panel:** Automation (M1-M6), Scrapers, and AI Processing |
| [**tribarato_fe**](./tribarato_fe) | Astro 6+, React 19, Tailwind v4 | **Frontend / Public:** High-performance interface optimized for SEO |

## Data Flow

```
tribarato_be (Server Actions) → Turso DB (SQLite) ← tribarato_fe (Astro SSR)
```

The **Backend** injects processed data (reviews, prices, images). The **Frontend** reads that data in real-time via Server-side Rendering (SSR).

## ADRs (Architecture Decision Records)

- **ADR-001:** Choosing Turso (distributed SQLite) as the database
- **ADR-002:** Adopting Astro Islands for the frontend
- **ADR-003:** Modular structure (Vibecoding) for AI-assisted development
- **ADR-004:** In-memory cache with stampede protection

## Documentation

| Project | Documents |
|---------|-----------|
| **tribarato_fe** | [README](./tribarato_fe/README.md), [ARCHITECTURE](./tribarato_fe/ARCHITECTURE.md), [CONTRIBUTING](./tribarato_fe/CONTRIBUTING.md), [DATA_LAYER](./tribarato_fe/DATA_LAYER.md), [CHANGELOG](./tribarato_fe/CHANGELOG.md) |
| **tribarato_be** | [README](./tribarato_be/README.md), [ARCHITECTURE](./tribarato_be/ARCHITECTURE.md), [CONTRIBUTING](./tribarato_be/CONTRIBUTING.md), [API](./tribarato_be/API.md), [CHANGELOG](./tribarato_be/CHANGELOG.md) |
