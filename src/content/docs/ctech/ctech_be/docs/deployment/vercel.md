---
title: "Deploy on Vercel - CTECH Panel"
---

## Prerequisites

- Account on [Vercel](https://vercel.com)
- Vercel CLI installed: `npm i -g vercel`
- Turso database configured and its URL ready

## Step by Step

### 1. Connect Repository

```bash
cd /home/dan/Documentos/ctech/ctech_be
vercel login
vercel link
```

### 2. Configure Environment Variables

Via Vercel dashboard or CLI:

```bash
vercel env add TURSO_DATABASE_URL
vercel env add TURSO_AUTH_TOKEN
vercel env add ENCRYPTION_KEY
vercel env add NEXTAUTH_SECRET
```

### 3. Deploy

```bash
# Preview
vercel

# Production
vercel --prod
```

## next.config.ts Configuration

The project is already configured for Vercel (serverless). No changes to `next.config.ts` are needed for basic deployment.

## Required Environment Variables

| Variable | Description | Where to Get It |
|----------|-------------|-----------------|
| `TURSO_DATABASE_URL` | Turso database URL | `turso db show [name] --url` |
| `TURSO_AUTH_TOKEN` | Access token | `turso db tokens create [name]` |
| `ENCRYPTION_KEY` | AES-256-CBC key (32 chars) | Generate: `openssl rand -hex 16` |
| `NEXTAUTH_SECRET` | Secret for next-auth | Generate: `openssl rand -hex 32` |
| `GOOGLE_API_KEY` | (Optional) Google AI key | Google AI Studio |

## Post-Deploy Verification

1. Visit `/api/health` to verify database connection
2. Test login/cookie (if applicable)
3. Check logs in the "Deployments" tab on Vercel

## Troubleshooting

**Turso connection error:**
- Check if the token has expired: `turso db tokens list [name]`
- Confirm the URL is in the correct format (`libsql://...`)

**Build fails:**
- Verify all env vars are set
- Test the build locally: `pnpm build`
