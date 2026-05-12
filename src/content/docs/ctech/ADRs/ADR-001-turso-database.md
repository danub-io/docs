---
title: "ADR-001: Turso as the Database"
---



**Date:** 2026-04-15
**Status:** Accepted

## Context

The CTECH ecosystem needs a database that:
- Is accessible both from the backend (Next.js) and the frontend (Astro)
- Supports SSR with low latency
- Has global read replication (data queried by the frontend worldwide)
- Does not require server management (serverless)
- Supports SQL (relational, with joins, indexes)

## Decision

We chose **Turso** (distributed SQLite via libsql) as the single database for the ecosystem.

## Alternatives Considered

| Alternative | Reason for Rejection |
|------------|-------------------|
| PostgreSQL (Supabase/Neon) | More operational complexity, higher cost for current volume |
| MongoDB | Non-relational, would complicate queries with joins across products, reviews, and affiliates |
| PlanetScale (MySQL) | Good, but Turso offers SQLite with simpler edge replication |
| Local SQLite | No replication, no shared access between BE and FE |

## Consequences

- Positives: Shared database without an intermediate REST API, pure SQL, edge-ready, zero cost at low volume
- Negatives: No triggers/stored procedures, no declarative migrations (we use Drizzle), lock on concurrent writes (mitigated by a processing queue in the BE)
- Risk: Exposed auth token (mitigated: SSR-only access, never on the client)

## References

- [Turso Architecture](https://turso.tech)
- [libsql-client](https://github.com/tursodatabase/libsql-client-ts)
- `ctech_fe/src/core/lib/db.ts`
- `ctech_be/drizzle.config.ts`
