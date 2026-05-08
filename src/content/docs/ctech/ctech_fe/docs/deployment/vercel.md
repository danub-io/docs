---
title: "Deploy na Cloudflare Workers"
---



> **Nota:** O ctech_fe faz deploy exclusivamente em **Cloudflare Workers**, não na Vercel.

## Pré-requisitos

- Conta na [Cloudflare](https://cloudflare.com)
- [wrangler](https://developers.cloudflare.com/workers/wrangler/) CLI instalado
- Token de API da Cloudflare com permissões `workers_scripts:write`, `workers_routes:write` e `workers_kv:write`

## Deploy Automático (Tags)

O deploy em produção é controlado por tags semânticas via GitHub Actions:

1. Desenvolva em `feat/*` → PR para `develop`
2. Faça merge de `develop` para `production`
3. Crie uma tag semântica e faça push:

```bash
git tag v1.0.0
git push origin v1.0.0
```

4. O CI detecta a tag, executa lint, testes, build e deploy automaticamente

## Deploy Manual

```bash
pnpm deploy
```

O Worker ficará disponível em `https://ctech-fe.<seu-subdominio>.workers.dev`.

## Variáveis de Ambiente (Secrets)

Configure os secrets no Worker via wrangler:

```bash
pnpm wrangler secret put TURSO_DATABASE_URL
pnpm wrangler secret put TURSO_AUTH_TOKEN
pnpm wrangler secret put AUTH_SECRET
pnpm wrangler secret put GOOGLE_CLIENT_ID
pnpm wrangler secret put GOOGLE_CLIENT_SECRET
```

### Verificação e Redeploy

Após configurar ou alterar secrets, verifique e faça redeploy obrigatório:

```bash
pnpm wrangler secret list
pnpm run deploy
```

> **Nota:** Secrets configurados via `wrangler secret put` só entram em vigor na próxima versão do Worker. Sem o redeploy, o Worker lança **Error 1101**.

## Notas

- O adaptador `@astrojs/cloudflare` está configurado em modo `directory`
- A flag `nodejs_compat` está ativada em `wrangler.jsonc` (necessária para `node:crypto`)
- O middleware de segurança (CSP, HSTS) funciona sem configuração adicional
- Sitemap é gerado automaticamente no build
- Para desenvolvimento local, crie `.dev.vars` com as variáveis de ambiente

### Acesso a Secrets em Runtime

No runtime Cloudflare Workers, `import.meta.env` **não** contém automaticamente os secrets. Os módulos usam o padrão:

```ts
const val = import.meta.env.MINHA_VAR || process.env.MINHA_VAR;
```

Isso garante compatibilidade entre desenvolvimento (Astro/miniflare) e produção (Workers).
