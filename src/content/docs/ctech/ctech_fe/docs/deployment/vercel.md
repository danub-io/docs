---
title: "Deploy on Cloudflare Workers"
---

> **Note:** ctech_fe deploys exclusively on **Cloudflare Workers**, not Vercel.

## Prerequisites

- [Cloudflare](https://cloudflare.com) account
- [wrangler](https://developers.cloudflare.com/workers/wrangler/) CLI installed
- Cloudflare API token with `workers_scripts:write`, `workers_routes:write`, and `workers_kv:write` permissions

## Automatic Deploy (Tags)

Production deployment is controlled by semantic tags via GitHub Actions:

1. Develop on `feat/*` → PR to `develop`
2. Merge `develop` into `production`
3. Create a semantic tag and push:

```bash
git tag v1.0.0
git push origin v1.0.0
```

4. CI detects the tag, runs lint, tests, build, and deploys automatically

## Manual Deploy

```bash
pnpm deploy
```

The Worker will be available at `https://ctech-fe.<your-subdomain>.workers.dev`.

## Environment Variables (Secrets)

Configure Worker secrets via wrangler:

```bash
pnpm wrangler secret put TURSO_DATABASE_URL
pnpm wrangler secret put TURSO_AUTH_TOKEN
pnpm wrangler secret put AUTH_SECRET
pnpm wrangler secret put GOOGLE_CLIENT_ID
pnpm wrangler secret put GOOGLE_CLIENT_SECRET
```

### Verification and Redeploy

After configuring or changing secrets, verify and redeploy (required):

```bash
pnpm wrangler secret list
pnpm run deploy
```

> **Note:** Secrets configured via `wrangler secret put` only take effect on the next Worker version. Without redeploy, the Worker throws **Error 1101**.

## Notes

- The `@astrojs/cloudflare` adapter is configured in `directory` mode
- The `nodejs_compat` flag is enabled in `wrangler.jsonc` (required for `node:crypto`)
- The security middleware (CSP, HSTS) works without additional configuration
- Sitemap is generated automatically on build
- For local development, create `.dev.vars` with environment variables

### Runtime Secret Access

In the Cloudflare Workers runtime, `import.meta.env` does **not** automatically contain secrets. Modules use the pattern:

```ts
const val = import.meta.env.MY_VAR || process.env.MY_VAR;
```

This ensures compatibility between development (Astro/miniflare) and production (Workers).
