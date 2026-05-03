---
title: "ADR-004: Cache em Memória com Proteção contra Stampede"
---



**Data:** 2026-04-20
**Status:** Aceito

## Contexto

Serviços do frontend consultam o banco Turso diretamente em SSR. Consultas repetitivas (categorias, slugs, menus) geram latência desnecessária. Precisávamos de cache que:
- Fosse simples (sem Redis/DynamoDB)
- Protegesse contra cache stampede (N requisições batendo no banco quando o cache expira)
- Funcionasse em serverless (sem estado compartilhado entre instâncias)

## Decisão

Implementamos cache em memória (Map) com TTL configurável e proteção contra stampede via `pendingFetch` compartilhado.

## Padrão

```typescript
let cached: T | null = null;
let lastFetch = 0;
let pendingFetch: Promise<T> | null = null;

async function obter() {
  if (cached && Date.now() - lastFetch < TTL) return cached;
  if (!pendingFetch) {
    pendingFetch = (async () => {
      try { /* fetch */ } finally { pendingFetch = null; }
    })();
  }
  return pendingFetch;
}
```

## Alternativas Consideradas

| Alternativa | Motivo da Rejeição |
|------------|-------------------|
| Redis | Dependência externa, custo operacional |
| Cache HTTP (CDN) | Não funciona para dados dinâmicos em SSR |
| Sem cache | Latência alta em cada requisição |
| Cache Map sem stampede protection | N requisições concorrentes batem no banco |

## Consequências

- Positivas: Zero dependência externa, stampede prevention embutido
- Negativas: Cache é invalidado apenas no restart do servidor (in-memory)
- Negativas: Cache não é compartilhado entre instâncias (aceitável para serverless com baixa concorrência)

## TTLs Atuais

| Serviço | TTL |
|---------|-----|
| `servicoCatalogo.obterCategorias` | 5 min |
| `servicoMenu.obterMenu` | 5 min |
| `servicoProduto.obterTodosSlugs` | 1 h |
| `servicoGuia.obterCategoriasComGuias` | 30 min |
| `servicoInicio` (destaque + recentes) | 2 min |

## Referências

- `ctech_fe/DATA_LAYER.md`
- `ctech_fe/AGENTS.md`
