---
title: "ADR-001: Turso como Banco de Dados"
---



**Data:** 2026-04-15
**Status:** Aceito

## Contexto

O ecossistema CTECH precisa de um banco de dados que:
- Seja acessível tanto pelo backend (Next.js) quanto pelo frontend (Astro)
- Suporte SSR com baixa latência
- Tenha replicação global para leitura (dados consultados pelo frontend em todo o mundo)
- Não exija gerenciamento de servidor (serverless)
- Suporte SQL (relacional, com joins, indices)

## Decisão

Escolhemos **Turso** (SQLite distribuído via libsql) como banco de dados único do ecossistema.

## Alternativas Consideradas

| Alternativa | Motivo da Rejeição |
|------------|-------------------|
| PostgreSQL (Supabase/Neon) | Mais complexidade operacional, custo maior para o volume atual |
| MongoDB | Não-relacional, dificultaria queries com joins entre produtos, reviews e afiliados |
| PlanetScale (MySQL) | Bom, mas Turso oferece SQLite com edge replication mais simples |
| SQLite local | Sem replicação, sem acesso compartilhado entre BE e FE |

## Consequências

- Positivas: Banco compartilhado sem REST API intermediária, SQL puro, edge-ready, custo zero em baixo volume
- Negativas: Sem triggers/stored procedures, sem migrações declarativas (usamos Drizzle), lock em escrita concorrente (mitigado por fila de processamento no BE)
- Risco: Token de autenticação exposto (mitigado: acesso apenas SSR, nunca no cliente)

## Referências

- [Turso Architecture](https://turso.tech)
- [libsql-client](https://github.com/tursodatabase/libsql-client-ts)
- `ctech_fe/src/core/lib/db.ts`
- `ctech_be/drizzle.config.ts`
