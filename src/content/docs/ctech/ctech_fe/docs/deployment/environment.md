---
title: "Environment Variables (ctech_fe)"
---

The frontend requires the following environment variables:

## Required

```ini
# Turso database URL (distributed SQLite)
# Retrieved from the Turso dashboard (https://turso.tech)
TURSO_DATABASE_URL=libsql://your-database-username.turso.io

# Turso authentication token
# Generate with: turso db tokens create <database-name>
TURSO_AUTH_TOKEN=your-token-here

# Secret key for JWT signing
# Generate with: openssl rand -hex 32
AUTH_SECRET=********************************
```

## Google OAuth (Optional)

```ini
# Google OAuth Client ID and Secret
# Retrieved from Google Cloud Console (https://console.cloud.google.com)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

## Community Module (Optional)

```ini
# Enables/disables the community module (login, user reviews, feed)
# true = enabled, false or omitted = disabled (default)
COMMUNITY_ENABLED=false
```

> **Note:** When disabled, all `/community`, `/dashboard`, `/api/auth/*`, `/api/reviews/*`, and `user-reviews` routes return 404 and the middleware does not load `currentUser`.

## How to Configure

### Local Development

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Also copy to **`.dev.vars`** (required for the Cloudflare Workers runtime):
   ```bash
   cp .env.example .dev.vars
   ```
3. Fill in the values with your credentials
4. Both files are in `.gitignore` (do not commit)

> **`.dev.vars`** is required by the Cloudflare Workers runtime (miniflare) used by `@astrojs/cloudflare`. Without it, `import.meta.env.TURSO_DATABASE_URL` will be `undefined` and initialization will fail.

### Production (Cloudflare Workers)

Configure Worker secrets via `pnpm wrangler secret put <NAME>`. See [vercel.md](./vercel.md) for deployment details.

> **Important:** In the Cloudflare Workers runtime, `import.meta.env` does not expose secrets automatically. Modules use the pattern `import.meta.env.X || process.env.X`.

## Getting Turso Credentials

```bash
# Install Turso CLI
curl -sSfL https://get.turso.tech | bash

# Login
turso auth login

# List databases
turso db list

# Get URL and token
turso db show <database-name>
turso db tokens create <database-name>
```

## Differences from the Backend (ctech_be)

ctech_fe does **not** use:
- `ENCRYPTION_KEY` (only the backend needs it to encrypt AI keys)
- `NEXTAUTH_SECRET` / `NEXTAUTH_URL` (the frontend uses its own JWT with `jose`)
- AI provider API keys (`GOOGLE_API_KEY`, `GROQ_API_KEY`, etc.)

The only shared variables between the two projects are `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN`.
