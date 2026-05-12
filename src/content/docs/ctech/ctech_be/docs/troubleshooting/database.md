---
title: "Database Problems (Turso)"
---

## Error: "Database connection failed"

### Symptom
```
Error: Connection timeout to Turso database
```

### Solution
1. Check if the token has expired:
```bash
turso db tokens list [db-name]
```

2. Generate a new token if needed:
```bash
turso db tokens create [db-name]
```

3. Update the `TURSO_AUTH_TOKEN` variable in `.env` or Vercel

---

## Error: "Database is locked"

### Symptom
```
SQLITE_BUSY: database is locked
```

### Solution
- Turso is serverless and may have a limit on concurrent connections
- Check if multiple scripts are running simultaneously
- During development, avoid running multiple `pnpm dev` instances

---

## Migrations not applied

### Check status
```bash
cd /home/dan/Documentos/ctech/ctech_be
cat migrations/*.sql
```

### Apply manually via Turso CLI
```bash
turso db shell [db-name]
# Paste the migration SQL
```

---

## Clear Database (Development)

```bash
# Delete and recreate local database (if using local SQLite)
rm data/*.db
turso db destroy [db-name]  # CAUTION: Deletes everything on remote Turso
```

---

## Check Current Schema

```bash
turso db shell [db-name] ".schema"
```

Or via the interface: Turso has a Data Explorer in the web dashboard.
