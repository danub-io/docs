---
title: "Troubleshooting: Banco de Dados (Turso)"
---



## Erro: "TURSO_DATABASE_URL is missing!"

**Causa:** Variável de ambiente não configurada.

**Solução:** Configure `TURSO_DATABASE_URL` no `.env` (desenvolvimento) ou nas variáveis de ambiente da plataforma (produção).

## Erro: "Authorization failed"

**Causa:** Token de autenticação inválido ou expirado.

**Solução:**
```bash
turso auth login
turso db tokens create <nome-do-banco>
```
Atualize `TURSO_AUTH_TOKEN` com o novo token.

## Erro: "Connection refused"

**Causa:** Banco Turso offline ou URL incorreta.

**Solução:**
- Verifique se o banco existe: `turso db list`
- Verifique a URL: `turso db show <nome-do-banco>`
- Verifique o status do Turso: [status.turso.tech](https://status.turso.tech)

## Banco retorna resultados vazios

**Causa:** Dados ainda não foram inseridos pelo backend, ou filtro exclui todos os registros.

**Solução:**
- Verifique se o backend (ctech_be) já processou produtos
- Verifique o status dos produtos no banco (devem ter `status = 'AprovadoM4'`)
- Teste a consulta diretamente: `turso db shell <nome-do-banco> "SELECT * FROM Produtos LIMIT 5"`

## Performance Lenta

**Causa:** Consultas sem índice, latência de rede para Turso.

**Solução:**
- Verifique os índices no schema do banco
- Considere cache adicional no frontend
- Use `EXPLAIN QUERY PLAN` para diagnosticar consultas lentas
