---
title: "Monitoring and Operations — CTECH Backend"
---

This document describes how to monitor and operate the backend in production.

## Health Check

Endpoint: `GET /api/health`

Returns the server and queue status:

```json
{
  "status": "healthy",
  "timestamp": "2026-05-03T12:00:00Z",
  "queue": {
    "pending": 5,
    "processing": 2,
    "errored": 1
  },
  "worker": {
    "active": true,
    "lastHeartbeat": "2026-05-03T11:59:30Z"
  },
  "uptime": 3600
}
```

### Quick Check

```bash
curl https://ctech-be.vercel.app/api/health
```

## Logging (Pino)

The project uses **Pino** as its structured logger. Do not use `console.log`.

### Basic Usage

```typescript
import { logger } from '@/lib/logger';

logger.info('Product processed', { produtoId: 123, modulo: 'M3' });
logger.warn('Token about to expire', { diasRestantes: 5 });
logger.error({ err }, 'Scraping processing failed');
```

### Levels

| Level | Usage |
|-------|-------|
| `info` | Normal operations (job start/finish) |
| `warn` | Non-critical abnormal situations |
| `error` | Failures requiring attention |
| `fatal` | Failures that prevent operation |

### Database Logs

In addition to Pino (stdout), logs for AI operations, scraping, and processing are saved in the `logs_entrada` table for review via M8 (System Logs).

## Workers and Queues

### Architecture

```
Job (fila_processamento) → atomic claim (status = 'processando')
                         → execution with timeout
                         → success: status = 'concluido'
                         → error < 3 attempts: status = 'pendente', tentativas++
                         → error >= 3: status = 'falha_critica' (DLQ)
```

### Worker Healthcheck

The worker updates `worker_control.last_heartbeat` every 30 seconds. If the heartbeat is not updated for more than 2 minutes, the worker is considered dead.

### Commands

```bash
# Check pending queue
pnpm exec tsx -e "
  import { db } from '@/lib/db';
  const result = await db.execute('SELECT status, COUNT(*) as qtd FROM fila_processamento GROUP BY status');
  console.table(result.rows);
"

# Re-process errored jobs
pnpm exec tsx -e "
  await db.execute({
    sql: \"UPDATE fila_processamento SET status = 'pendente', tentativas = 0 WHERE status IN ('erro', 'falha_critica')\",
    args: []
  });
"
```

### DLQ (Dead Letter Queue)

Jobs with 3 failed attempts go to `status = 'falha_critica'`. They require manual review:

- Analyze the error in the `erro` column of `fila_processamento`
- Fix the root cause
- Reset to `pendente` manually

## Local Debugging

### Real-time Logs

```bash
pnpm dev                # Logs to stdout (Pino pretty)
pnpm dev | pino-pretty  # More readable formatting
```

### Query Logs in the Database

```bash
pnpm exec tsx -e "
  const logs = await db.execute('SELECT * FROM logs_entrada ORDER BY timestamp DESC LIMIT 20');
  console.table(logs.rows);
"
```

## Recommended Alerts

| Condition | Action |
|-----------|--------|
| `fila_processamento` has > 50 `pendente` jobs | Worker may be offline |
| Worker no heartbeat for > 2 min | Restart worker |
| More than 10 jobs in `falha_critica` | Review DLQ manually |
| 500 error on `/api/health` | Server may be overloaded |
