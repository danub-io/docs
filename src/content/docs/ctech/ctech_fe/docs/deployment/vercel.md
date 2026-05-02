---
title: "Deploy na Vercel"
---



## Pré-requisitos

- Repositório no GitHub conectado à Vercel
- Framework preset: `Astro`
- Node.js versão 22+

## Configuração

1. Importe o repositório na Vercel
2. Configure as variáveis de ambiente (veja [environment.md](./environment.md))
3. Framework: selecione **Astro** ou deixe "Auto-detect"
4. Build command: `pnpm build`
5. Output directory: `dist`

## Variáveis de Ambiente na Vercel

| Variável | Valor | Obrigatório |
|----------|-------|-------------|
| `TURSO_DATABASE_URL` | `libsql://seu-banco.turso.io` | Sim |
| `TURSO_AUTH_TOKEN` | Token de autenticação | Sim |

> **Importante:** Marque `TURSO_AUTH_TOKEN` como "Secret" no dashboard da Vercel.

## Notas

- O adaptador `@astrojs/node` está configurado em modo `standalone`
- O middleware de segurança (CSP, HSTS) funciona sem configuração adicional
- Sitemap é gerado automaticamente no build
