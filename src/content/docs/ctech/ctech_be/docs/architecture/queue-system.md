---
title: "Queue System and DLQ - CTECH Panel"
---

## Overview

The project uses a `fila_processamento` table in Turso SQLite to manage async jobs. The worker (`src/app/actions/worker.ts`) processes jobs from 4 modules: `descoberta`, `extracao`, `consolidacao`, `precos`.

## Job States

| Status | Description |
|--------|-------------|
| `pendente` | Awaiting processing |
| `processando` | Job running (atomic claim) |
| `concluido` | Successfully processed |
| `erro` | Temporary failure (increments `tentativas`) |
| `falha_critica` | DLQ: 3+ failures, will not be reprocessed |

## Worker Flow

```typescript
// 1. Atomic claim (prevents race conditions)
const job = await claimNextJob();

// 2. Execution with timeout (WORKER_JOB_TIMEOUT_MS)
const result = await Promise.race([
    executeJob(job),
    timeout(WORKER_JOB_TIMEOUT_MS)
]);

// 3. Finalization
if (sucesso) await finishJob(job.id, "concluido");
else await finishJob(job.id, "erro", erro);
```

## Resilience (DLQ)

- Each failure increments `tentativas` in the table
- After reaching **3 attempts**, the job goes to `falha_critica`
- Jobs in `falha_critica` are no longer processed automatically
- Requires manual intervention or a database reset

## Available Functions

### `processNextJob()`
Processes the next job in the queue. Atomically claims it and executes the task corresponding to the module.

### `runWorkerBatch(limit?)`
Processes up to `limit` jobs sequentially (default: 5).

### `claimNextJob()` (lib/queue.ts)
Internal function that performs an atomic SELECT + UPDATE to claim the next `pendente` job.

### `finishJob(jobId, status, error?)` (lib/queue.ts)
Updates the job status and records the completion timestamp.

### `updateWorkerHeartbeat(active)` (lib/queue.ts)
Updates the worker heartbeat for health monitoring.

## Monitoring

- **Health Check:** `GET /api/health` returns worker status (`active`, `lastHeartbeat`)
- **Logs:** All operations are logged via `pino` (`@/lib/logger`)
- **Settings Page:** `/8-configuracoes/logs` displays real-time logs

## Configuration

The job timeout is defined in `@/lib/constants`:
```typescript
WORKER_JOB_TIMEOUT_MS // Default timeout per job
```

## Cleanup

There is no automatic cleanup of completed jobs. It is recommended to keep only the last N days based on data volume.
