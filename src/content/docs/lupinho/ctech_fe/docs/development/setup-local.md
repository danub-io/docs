---
title: "Local Setup — CTECH Frontend"
---

Step-by-step guide for setting up the frontend development environment.

## Prerequisites

- **Node.js** >= 22.12.0
- **pnpm** (package manager)
- **Turso CLI** (for database)

```bash
# Install pnpm (if not installed)
npm install -g pnpm

# Install Turso CLI
curl -sSfL https://get.turso.tech | bash
```

## Steps

### 1. Clone and install dependencies

```bash
git clone <repo-url>
cd ctech_fe
pnpm install
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` with your Turso credentials:

```ini
TURSO_DATABASE_URL=libsql://your-database-username.turso.io
TURSO_AUTH_TOKEN=your-token-here
```

### 3. Get Turso credentials

```bash
# Login to Turso
turso auth login

# List available databases
turso db list

# Get database URL
turso db show <database-name>

# Generate authentication token
turso db tokens create <database-name>
```

### Option A: Remote database (Turso)

Recommended for development. Use the team's shared database or create your own:

```bash
turso db create ctech-dev
turso db show ctech-dev        # URL
turso db tokens create ctech-dev  # Token
```

### Option B: Local database (SQLite)

For offline development, use local SQLite:

1. Create a `local.db` file in the project
2. Point `.env` to it:
   ```ini
   TURSO_DATABASE_URL=file:./local.db
   TURSO_AUTH_TOKEN=
   ```
3. Populate with seed data (if available):
   ```bash
   node scripts/seed_guias.mjs
   ```

### 4. Start development server

```bash
pnpm dev
```

Access http://localhost:4321

## Useful Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Dev server with hot-reload |
| `pnpm build` | Production build |
| `pnpm preview` | Build preview |
| `pnpm lint` | Check lint |
| `pnpm format` | Format code |
| `pnpm test:run` | Unit tests |
| `pnpm test:coverage` | Tests with coverage |
| `pnpm test:e2e` | E2E tests (Playwright) |

## Troubleshooting

### "TURSO_DATABASE_URL is missing!"

`.env` was not created or is incomplete. Copy from `.env.example`.

### "Sharp is not available"

```bash
pnpm add sharp
pnpm rebuild sharp
```

### Database returns empty

Check whether the backend (ctech_be) has already populated the database with products having `status = 'AprovadoM4'`.

```bash
turso db shell <database-name> "SELECT COUNT(*) FROM Produtos WHERE status = 'AprovadoM4'"
```
