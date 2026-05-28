---
title: "Deploy with Docker - CTECH Panel"
---

## Prerequisites

- Docker and Docker Compose installed
- Turso database (or local SQLite for testing)

## Dockerfile

Create a `Dockerfile` at the root:

```dockerfile
FROM node:20-alpine AS base

# Install dependencies
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install

# Build
COPY . .
RUN pnpm build

# Production image
FROM node:20-alpine
WORKDIR /app
COPY --from=base /app/.next ./.next
COPY --from=base /app/public ./public
COPY --from=base /app/package.json ./package.json
COPY --from=base /app/node_modules ./node_modules

EXPOSE 3000
CMD ["pnpm", "start"]
```

## Docker Compose

```yaml
version: '3.8'

services:
  ctech:
    build: .
    ports:
      - "3000:3000"
    environment:
      - TURSO_DATABASE_URL=${TURSO_DATABASE_URL}
      - TURSO_AUTH_TOKEN=${TURSO_AUTH_TOKEN}
      - ENCRYPTION_KEY=${ENCRYPTION_KEY}
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

## Running

```bash
# Create .env file with the variables
cat > .env << EOL
TURSO_DATABASE_URL=libsql://...
TURSO_AUTH_TOKEN=...
ENCRYPTION_KEY=...
NEXTAUTH_SECRET=...
EOL

# Start container
docker-compose up -d

# View logs
docker-compose logs -f
```

## Notes

- Next.js in production requires database access at runtime
- For local SQLite, mount a volume: `./data:/app/data`
- Turso is recommended for production (managed remote SQLite)
