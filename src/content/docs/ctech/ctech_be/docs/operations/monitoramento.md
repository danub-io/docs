---
title: "Monitoramento e Operações — Backend CTECH"
---



Este documento descreve como monitorar e operar o backend em produção.

## Health Check

Endpoint: `GET /api/health`

Retorna o estado do servidor e da fila de processamento:

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

### Verificação rápida

```bash
curl https://ctech-be.vercel.app/api/health
```

## Logging (Pino)

O projeto usa **Pino** como logger estruturado. Não use `console.log`.

### Uso básico

```typescript
import { logger } from '@/lib/logger';

logger.info('Produto processado', { produtoId: 123, modulo: 'M3' });
logger.warn('Token prestes a expirar', { diasRestantes: 5 });
logger.error({ err }, 'Falha ao processar scraping');
```

### Níveis

| Nível | Uso |
|-------|-----|
| `info` | Operações normais (início/fim de jobs) |
| `warn` | Situações anormais não críticas |
| `error` | Falhas que precisam atenção |
| `fatal` | Falhas que impedem o funcionamento |

### Logs no Banco

Além do Pino (stdout), logs de operações de IA, scraping e processamento são salvos na tabela `logs_entrada` para consulta via M8 (Logs de Sistema).

## Workers e Filas

### Arquitetura

```
Job (fila_processamento) → claim atômico (status = 'processando')
                         → execução com timeout
                         → sucesso: status = 'concluido'
                         → erro < 3 tentativas: status = 'pendente', tentativas++
                         → erro >= 3: status = 'falha_critica' (DLQ)
```

### Healthcheck do Worker

O worker atualiza `worker_control.last_heartbeat` a cada 30s. Se o heartbeat não for atualizado por > 2 minutos, o worker é considerado morto.

### Comandos

```bash
# Verificar fila pendente
pnpm exec tsx -e "
  import { db } from '@/lib/db';
  const result = await db.execute('SELECT status, COUNT(*) as qtd FROM fila_processamento GROUP BY status');
  console.table(result.rows);
"

# Reprocessar jobs com erro
pnpm exec tsx -e "
  await db.execute({
    sql: \"UPDATE fila_processamento SET status = 'pendente', tentativas = 0 WHERE status IN ('erro', 'falha_critica')\",
    args: []
  });
"
```

### DLQ (Dead Letter Queue)

Jobs com 3 tentativas falhas vão para `status = 'falha_critica'`. Eles precisam de revisão manual:

- Analisar o erro na coluna `erro` da `fila_processamento`
- Corrigir a causa raiz
- Resetar para `pendente` manualmente

## Debug Locais

### Logs em tempo real

```bash
pnpm dev                # Logs no stdout (Pino pretty)
pnpm dev | pino-pretty  # Formatação mais legível
```

### Consultar logs no banco

```bash
pnpm exec tsx -e "
  const logs = await db.execute('SELECT * FROM logs_entrada ORDER BY timestamp DESC LIMIT 20');
  console.table(logs.rows);
"
```

## Alertas Recomendados

| Condição | Ação |
|----------|------|
| `fila_processamento` com > 50 jobs `pendente` | Worker pode estar offline |
| Worker sem heartbeat > 2 min | Reiniciar worker |
| Mais de 10 jobs em `falha_critica` | Revisar DLQ manualmente |
| Erro 500 em `/api/health` | Servidor pode estar sobrecarregado |
