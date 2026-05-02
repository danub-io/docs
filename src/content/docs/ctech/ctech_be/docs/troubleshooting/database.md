---
title: "Problemas com Banco de Dados (Turso)"
---



## Erro: "Database connection failed"

### Sintoma
```
Error: Connection timeout to Turso database
```

### Solução
1. Verifique se o token não expirou:
```bash
turso db tokens list [nome-db]
```

2. Gere um novo token se necessário:
```bash
turso db tokens create [nome-db]
```

3. Atualize a variável `TURSO_AUTH_TOKEN` no `.env` ou Vercel

---

## Erro: "Database is locked"

### Sintoma
```
SQLITE_BUSY: database is locked
```

### Solução
- Turso é serverless e pode ter limite de conexões simultâneas
- Verifique se não há múltiplos scripts rodando simultaneamente
- Em desenvolvimento, evite múltiplas instâncias do `pnpm dev`

---

## Migrations não aplicadas

### Verificar status
```bash
cd /home/dan/Documentos/ctech/ctech_be
cat migrations/*.sql
```

### Aplicar manualmente via Turso CLI
```bash
turso db shell [nome-db]
# Colar o SQL das migrations
```

---

## Limpar banco (Desenvolvimento)

```bash
# Deletar e recriar banco local (se usando SQLite local)
rm data/*.db
turso db destroy [nome-db]  # CUIDADO: Apaga tudo no Turso remoto
```

---

## Verificar schema atual

```bash
turso db shell [nome-db] ".schema"
```

Ou via interface: o Turso possui um Data Explorer no dashboard web.
