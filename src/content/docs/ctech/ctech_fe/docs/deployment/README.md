---
title: "Deploy — Documentação"
---



Guia para deploy do frontend CTECH em diferentes ambientes.

## Documentos

- [vercel.md](./vercel.md) — Deploy na Vercel
- [environment.md](./environment.md) — Configuração de variáveis de ambiente

## Quick Start

```bash
pnpm install
pnpm build   # Gera dist/ com saída standalone
pnpm preview # Testa localmente
```

O build gera uma aplicação Node.js standalone em `dist/`. Sirva com qualquer servidor Node.js 22+.
