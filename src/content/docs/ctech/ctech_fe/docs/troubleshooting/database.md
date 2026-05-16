---
title: "Troubleshooting: Database (Turso)"
---

## Error: "TURSO_DATABASE_URL is missing!"

**Cause:** Environment variable not configured.

**Solution:** Set `TURSO_DATABASE_URL` in `.env` (development) or in the platform environment variables (production).

## Error: "Authorization failed"

**Cause:** Invalid or expired authentication token.

**Solution:**
```bash
turso auth login
turso db tokens create <database-name>
```
Update `TURSO_AUTH_TOKEN` with the new token.

## Error: "Connection refused"

**Cause:** Turso database offline or incorrect URL.

**Solution:**
- Check if the database exists: `turso db list`
- Check the URL: `turso db show <database-name>`
- Check Turso status: [status.turso.tech](https://status.turso.tech)

## Database returns empty results

**Cause:** Data has not been ingested by the backend yet, or the filter excludes all records.

**Solution:**
- Verify that the backend (ctech_be) has processed products
- Check product status in the database (must have `status = 'AprovadoM4'`)
- Test the query directly: `turso db shell <database-name> "SELECT * FROM Produtos LIMIT 5"`

## Slow Performance

**Cause:** Queries without indexes, network latency to Turso.

**Solution:**
- Review indexes in the database schema
- Consider additional frontend caching
- Use `EXPLAIN QUERY PLAN` to diagnose slow queries
