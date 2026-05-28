---
title: "CTECH Scripts"
---

This directory contains operational utilities and scripts for the CTECH backend.

## Operational (Root)
- **check-scrapers.ts**: Checks the status and connectivity of configured scrapers.
- **debug-m6-errors.ts**: Tool for diagnosing specific failures in the M6 module (Checkout).
- **prepare-m6.ts**: Prepares data and the queue for running the M6 module.
- **retry-m6-errors.ts**: Re-enqueues M6 tasks that previously failed.
- **sync-m6.ts**: Synchronizes processed M6 data with the main database.

## Utilities (/utils)
- **diagnose-db.ts**: General health diagnosis of the Turso database.
- **fetch-product-images-v2.ts**: Automated product image fetching via Serper API.
- **find-config.ts**: Utility for locating configuration keys in the database.
- **find-item.ts**: Quick search for specific products or reviews by ID.
- **find-logs.ts**: Filters and displays recent ingestion logs.
- **inspect-all.ts**: Full inspection of the main tables' state.
- **list-tables.ts**: Lists all tables and record counts.
- **sync-images.ts**: Synchronizes image metadata between tables.

---
*Note: All scripts should be run via `npx tsx scripts/[name].ts` to ensure proper TypeScript environment loading.*
