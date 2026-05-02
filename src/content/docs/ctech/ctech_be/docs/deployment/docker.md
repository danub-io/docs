---
title: "Deploy com Docker - CTECH Painel"
---



## Pré-requisitos

- Docker e Docker Compose instalados
- Banco Turso (ou SQLite local para testes)

## Dockerfile

Crie um `Dockerfile` na raiz:

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

## Executar

```bash
# Criar arquivo .env com as variáveis
cat > .env << EOL
TURSO_DATABASE_URL=libsql://...
TURSO_AUTH_TOKEN=...
ENCRYPTION_KEY=...
NEXTAUTH_SECRET=...
EOL

# Subir container
docker-compose up -d

# Ver logs
docker-compose logs -f
```

## Notas

- Next.js em produção requer acesso ao banco em runtime
- Para SQLite local, monte um volume: `./data:/app/data`
- Turso é recomendado para produção (SQLite remoto gerenciado)
