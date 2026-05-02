---
title: "CTECH Scripts"
---



Este diretório contém utilitários e scripts operacionais para o backend CTECH.

## Operacionais (Raiz)
- **check-scrapers.ts**: Verifica o status e conectividade dos scrapers configurados.
- **debug-m6-errors.ts**: Ferramenta para diagnosticar falhas específicas no módulo M6 (Conferência).
- **prepare-m6.ts**: Prepara os dados e fila para execução do módulo M6.
- **retry-m6-errors.ts**: Re-enfileira tarefas do M6 que falharam anteriormente.
- **sync-m6.ts**: Sincroniza dados processados do M6 com a base principal.

## Utilitários (/utils)
- **diagnose-db.ts**: Diagnóstico geral de integridade do banco de dados Turso.
- **fetch-product-images-v2.ts**: Busca automática de imagens de produtos via Serper API.
- **find-config.ts**: Utilitário para localizar chaves de configuração no banco.
- **find-item.ts**: Busca rápida por produtos ou reviews específicos por ID.
- **find-logs.ts**: Filtra e exibe logs de ingestão recentes.
- **inspect-all.ts**: Inspeção completa do estado das tabelas principais.
- **list-tables.ts**: Lista todas as tabelas e contagem de registros.
- **sync-images.ts**: Sincroniza metadados de imagens entre tabelas.

---
*Nota: Todos os scripts devem ser executados via `npx tsx scripts/[nome].ts` para garantir o carregamento correto do ambiente TypeScript.*
