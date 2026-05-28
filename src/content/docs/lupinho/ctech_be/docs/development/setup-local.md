---
title: "Local Setup — CTECH Backend"
---

Step-by-step guide to setting up the backend development environment.

## Prerequisites

- **Node.js** >= 22.12.0
- **pnpm** (package manager)
- **Turso CLI** (for database)

```bash
# Install pnpm (if not already installed)
npm install -g pnpm

# Install Turso CLI
curl -sSfL https://get.turso.tech | bash
```

## Steps

### 1. Clone and install dependencies

```bash
git clone <repo-url>
cd ctech_be
pnpm install
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```ini
TURSO_DATABASE_URL=libsql://your-database-user.turso.io
TURSO_AUTH_TOKEN=your-token-here
ADMIN_SECRET=your-secret-key
ENCRYPTION_KEY=1234567890abcdef1234567890abcdef
```

### 3. Get Turso credentials

```bash
turso auth login
turso db list
turso db show <database-name>
turso db tokens create <database-name>
```

### 4. Apply database migrations

```bash
pnpm db:push
```

To generate new migrations after changing the schema:

```bash
pnpm db:generate
pnpm db:push
```

### 5. Start the development server

```bash
pnpm dev
```

Open http://localhost:3001

## Useful Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Dev server (Next.js, port 3001) |
| `pnpm build` | Production build |
| `pnpm lint` | Run linter |
| `pnpm test:run` | Unit tests |
| `pnpm test:e2e` | E2E tests (Playwright) |
| `pnpm db:push` | Apply migrations to database |
| `pnpm db:studio` | Open Drizzle Studio |
| `pnpm clean` | Clean `.next` and cache |

## Development Workflow

1. Edit code in the relevant module (M1-M9)
2. Test locally with `pnpm dev`
3. Run tests: `pnpm test:run`
4. Commit following Conventional Commits

## Troubleshooting

### "TURSO_DATABASE_URL is missing!"

Copy `.env.example` to `.env` and fill it in.

### "Failed to decrypt API key"

The `ENCRYPTION_KEY` was changed after the keys were saved. Use the original key or re-encrypt the AI provider keys via M8.

### "validateAction() failed"

Session expired or `ADMIN_SECRET` is incorrect. Check the session cookie and the `ADMIN_SECRET` value in `.env`.

### Migrations not applied

```bash
pnpm db:push
```

Verify the schema with:

```bash
turso db shell <database-name> ".schema"
```

### Build fails

```bash
pnpm clean
pnpm build
```
