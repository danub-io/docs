---
title: "Environment Variables Configuration"
---

## `.env.example` File

The project must include an `.env.example` file at the root with all required variables:

```bash
# Database (Turso)
TURSO_DATABASE_URL=libsql://your-database.turso.io
TURSO_AUTH_TOKEN=eyJhbGciOiJF...

# Encryption (AES-256-CBC)
ENCRYPTION_KEY=1234567890abcdef1234567890abcdef

# NextAuth
NEXTAUTH_SECRET=your-secret-here-32-chars-minimum
NEXTAUTH_URL=http://localhost:3000

# Optional (AI Providers)
GOOGLE_API_KEY=AIza...
GROQ_API_KEY=gsk_...
CEREBRAS_API_KEY=...
OPENROUTER_API_KEY=sk-or-...
GITHUB_TOKEN=ghp_...

# Logs
PINO_LOG_LEVEL=info  # trace|debug|info|warn|error|fatal
```

## How to Configure

### Local Development

1. Copy the example:
```bash
cp .env.example .env
```

2. Fill in your actual values
3. The `.env` file is in `.gitignore` (do not commit!)

### Production (Vercel)

Add via dashboard or CLI:
```bash
vercel env add TURSO_DATABASE_URL
vercel env add TURSO_AUTH_TOKEN
# ... repeat for each variable
```

### Verification

When starting the project, verify that all variables are loaded:
```bash
pnpm dev
# Check the startup logs
```

## Required vs Optional Variables

### Required
- `TURSO_DATABASE_URL`
- `TURSO_AUTH_TOKEN`
- `ENCRYPTION_KEY` (32 hex characters = 16 bytes)
- `NEXTAUTH_SECRET`

### Optional
- API keys for AI providers (configured via M8)
- `PINO_LOG_LEVEL` (default: `info`)

## Generating Secure Keys

```bash
# ENCRYPTION_KEY (16 bytes = 32 hex chars)
openssl rand -hex 16

# NEXTAUTH_SECRET (32 bytes = 64 hex chars)
openssl rand -hex 32
```
