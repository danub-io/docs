---
title: "CTECH — Hardware Curation Ecosystem"
---

Welcome to **CTECH** (TechReveal), an automated ecosystem for hardware analysis, comparison, and curation. This project leverages Artificial Intelligence and web automation to turn raw data into valuable business insights.

## Project Structure

The ecosystem is split into two main repositories that share the same **Turso (SQLite)** database.

| Repository | Technology | Role in the Ecosystem |
| :--- | :--- | :--- |
| [**ctech_be**](./ctech_be) | Next.js 16+, Turso, Pino | **Backend / Panel:** Automation (M1-M6), Scrapers, and AI Processing |
| [**ctech_fe**](./ctech_fe) | Astro 6+, React 19, Tailwind v4 | **Frontend / Public:** High-performance interface optimized for SEO |

## Data Flow

```
ctech_be (Server Actions) → Turso DB (SQLite) ← ctech_fe (Astro SSR)
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
| **ctech_fe** | [README](./ctech_fe/README.md), [ARCHITECTURE](./ctech_fe/ARCHITECTURE.md), [CONTRIBUTING](./ctech_fe/CONTRIBUTING.md), [DATA_LAYER](./ctech_fe/DATA_LAYER.md), [CHANGELOG](./ctech_fe/CHANGELOG.md) |
| **ctech_be** | [README](./ctech_be/README.md), [ARCHITECTURE](./ctech_be/ARCHITECTURE.md), [CONTRIBUTING](./ctech_be/CONTRIBUTING.md), [API](./ctech_be/API.md), [CHANGELOG](./ctech_be/CHANGELOG.md) |
