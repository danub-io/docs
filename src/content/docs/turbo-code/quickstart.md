---
title: "Quickstart"
---

## Prerequisites

- Node.js 20+
- OpenAI-compatible API key (DeepSeek, OpenAI, OpenRouter, Anthropic, Gemini)

## Setup

```bash
# Clone
git clone https://github.com/danub-io/turbo-code.git
cd turbo-code

# Configure API key (server auto-creates .env from .env.example if missing)
cp .env.example .env
# Edit .env with your API key

# Quick setup (installs all deps + builds)
npm run setup

# Or manually:
npm install
cd web && npm install && cd ..
npm run build

# Run
npm run dev
# Open http://localhost:3001 (default port, overridable via PORT env)
```

## Useful Commands

| Command | Description |
|---------|-----------|
| `npm run setup` | Install all deps + build (convenience) |
| `npm run dev` | Dev server (backend + frontend concurrently) |
| `npm run dev:server` | Backend only with hot-reload |
| `npm run dev:web` | Frontend Vite only |
| `npm run build` | Production build (backend + frontend) |
| `npm test` | Run unit tests |
| `npm run test:watch` | Tests in watch mode |

## Configuration

Copy `.env.example` to `.env` and configure:

```env
TURBO_API_KEY=sk-...
TURBO_MODEL=deepseek-v4-flash
TURBO_BASE_URL=https://opencode.ai/zen/go/v1
TURBO_CHEAP_MODEL=deepseek-v4-flash
```
