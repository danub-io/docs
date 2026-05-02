---
title: "Sistema de Filas e DLQ - CTECH Painel"
---



## Visão Geral

O projeto utiliza uma tabela `fila_processamento` no Turso SQLite para gerenciar jobs assíncronos. O worker (`src/app/actions/worker.ts`) processa jobs de 4 módulos: `descoberta`, `extracao`, `consolidacao`, `precos`.

## Estados do Job

| Status | Descrição |
|--------|-----------|
| `pendente` | Aguardando processamento |
| `processando` | Job em execução (claim atômico) |
| `concluido` | Processado com sucesso |
| `erro` | Falha temporária (incrementa `tentativas`) |
| `falha_critica` | DLQ: 3+ falhas, não será reprocessado |

## Fluxo do Worker

```typescript
// 1. Claim atômico (evita race condition)
const job = await claimNextJob();

// 2. Execução com timeout (WORKER_JOB_TIMEOUT_MS)
const result = await Promise.race([
    executeJob(job),
    timeout(WORKER_JOB_TIMEOUT_MS)
]);

// 3. Finalização
if (sucesso) await finishJob(job.id, "concluido");
else await finishJob(job.id, "erro", erro);
```

## Resiliência (DLQ)

- Cada falha incrementa `tentativas` na tabela
- Ao atingir **3 tentativas**, o job vai para `falha_critica`
- Jobs em `falha_critica` não são mais processados automaticamente
- Necessário intervenção manual ou reset via banco

## Funções Disponíveis

### `processNextJob()`
Processa o próximo job na fila. Faz claim atômico e executa a tarefa correspondente ao módulo.

### `runWorkerBatch(limit?)`
Processa até `limit` jobs sequencialmente (padrão: 5).

### `claimNextJob()` (lib/queue.ts)
Função interna que faz SELECT + UPDATE atômico para pegar o próximo job `pendente`.

### `finishJob(jobId, status, error?)` (lib/queue.ts)
Atualiza o status do job e registra timestamp de conclusão.

### `updateWorkerHeartbeat(active)` (lib/queue.ts)
Atualiza o heartbeat do worker para monitoramento de saúde.

## Monitoramento

- **Health Check:** `GET /api/health` retorna status do worker (`active`, `lastHeartbeat`)
- **Logs:** Todas as operações são registradas via `pino` (`@/lib/logger`)
- **Página de Configurações:** `/8-configuracoes/logs` exibe logs em tempo real

## Configuração

O timeout dos jobs é definido em `@/lib/constants`:
```typescript
WORKER_JOB_TIMEOUT_MS // Timeout padrão por job
```

## Limpeza

Não há limpeza automática de jobs concluídos. Recomenda-se manter apenas os últimos N dias conforme volume de dados.
