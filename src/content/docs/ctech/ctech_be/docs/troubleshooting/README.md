---
title: "Troubleshooting"
---



Esta pasta contém soluções para problemas comuns encontrados durante o desenvolvimento e operação do CTECH Painel.

## Conteúdo

- `database.md` - Problemas com Turso/banco de dados
- `scraping.md` - Erros em web scraping e extração
- `ai-services.md` - Falhas em modelos de IA
- `common-errors.md` - Erros comuns e soluções rápidas
- `security.md` - Vulnerabilidades e práticas de segurança

## Debug

Para logs detalhados em desenvolvimento:

```bash
pnpm dev
# Logs estruturados com Pino
```

Para produção, configure `PINO_LOG_LEVEL` conforme necessário.
