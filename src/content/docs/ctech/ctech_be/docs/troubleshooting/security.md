---
title: "Segurança - CTECH Painel"
---



## Visão Geral
Este documento descreve as práticas de segurança, vulnerabilidades corrigidas e diretrizes para contribuidores.

## Vulnerabilidades Corrigidas

### SQL Injection (Commit `08881d7` - Abril 2026)
**Severidade:** Crítica 🔴

**Descrição:**
O projeto utilizava interpolação de strings para construir cláusulas `IN` em consultas SQL, permitindo injeção de SQL se os parâmetros não fossem devidamente sanitizados.

**Código Vulnerável (Antes):**
```typescript
// PERIGO: Interpolação direta
const ids = [1, 2, 3];
const query = `SELECT * FROM produtos WHERE id IN (${ids.join(',')})`;
await db.execute(query);
```

**Correção (Agora):**
```typescript
// SEGURO: Placeholders parametrizados
const ids = [1, 2, 3];
const placeholders = ids.map(() => '?').join(',');
const query = `SELECT * FROM produtos WHERE id IN (${placeholders})`;
await db.execute({ sql: query, args: ids });
```

**Impacto:**
- Afeta consultas em `src/lib/db.ts`, `src/lib/queue.ts` e repositórios
- Mitigado usando placeholders do `libsql`/`drizzle`

## Práticas de Segurança

### Criptografia de Chaves de API
As chaves de API dos provedores de IA são armazenadas criptografadas em `config_ai_models` e `config_scraping_services`:
- **Algoritmo:** AES-256-CBC
- **Chave:** Definida em `ENCRYPTION_KEY` no `.env`
- **Implementação:** `src/lib/encryption.ts`

### Validação de Entrada
- Todo input de usuário deve ser validado com **Zod** (schemas em cada Server Action)
- Server Actions são protegidas por `use server` e validação de parâmetros
- Sanitização de URLs em `src/lib/scrapers.ts` para evitar SSRF

### Acesso a Dados
- **Repository Pattern:** Isola consultas SQL em `src/lib/repositories/`
- **Princípio de Menor Privilégio:** Cada Server Action acessa apenas os dados necessários
- **Turso (libsql):** Banco SQLite remoto com conexões seguras via token

## Checklist de Segurança para PRs
- [ ] Novos endpoints/Server Actions têm validação Zod
- [ ] Consultas SQL usam placeholders (nunca interpolação)
- [ ] Chaves/Segredos não são commitados (usar `.env.example`)
- [ ] Criptografia de dados sensíveis em repouso (at-rest)
- [ ] Testes de segurança adicionados (`src/app/actions/__tests__/security.test.ts`)

## Reportar Vulnerabilidades
Para reportar vulnerabilidades de segurança, abra uma Issue com label `security` ou contate a equipe mantenedora diretamente.

**Não** divulgue vulnerabilidades publicamente antes de uma correção ser lançada.
