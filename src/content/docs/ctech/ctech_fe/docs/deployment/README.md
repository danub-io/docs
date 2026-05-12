---
title: "Deploy — Documentation"
---

Guide for deploying the CTECH frontend in different environments.

## Documents

- [vercel.md](./vercel.md) — Vercel deployment
- [environment.md](./environment.md) — Environment variable configuration

## Other Guides

- [docs/development/setup-local.md](../development/setup-local.md) — Development environment setup
- [docs/security/security.md](../security/security.md) — Security and hardening

## Quick Start

```bash
pnpm install
pnpm build   # Generates dist/ with standalone output
pnpm preview # Test locally
```

The build generates a standalone Node.js application in `dist/`. Serve it with any Node.js 22+ server.
