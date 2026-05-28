---
title: "Troubleshooting"
---

This folder contains solutions for common issues encountered during development and operation of the CTECH Panel.

## Contents

- `database.md` — Turso/database problems
- `scraping.md` — Web scraping and extraction errors
- `ai-services.md` — AI model failures
- `common-errors.md` — Common errors and quick solutions
- `security.md` — Vulnerabilities and security practices

## Debug

For detailed logs during development:

```bash
pnpm dev
# Structured logs with Pino
```

For production, set `PINO_LOG_LEVEL` as needed.
