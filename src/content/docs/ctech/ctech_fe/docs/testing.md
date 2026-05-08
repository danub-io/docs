---
title: "Testes — Estratégia"
---



## Visão Geral

O projeto utiliza duas camadas de teste:

| Camada | Ferramenta | O que testa | Localização |
|--------|-----------|-------------|-------------|
| Unitários | Vitest | Serviços, componentes React, utilitários | `__tests__/` junto ao arquivo |
| E2E | Playwright | Fluxos completos do usuário, páginas Astro | `tests/e2e/` |

## Comandos

```bash
# Unitários
pnpm test              # Watch mode (desenvolvimento)
pnpm test:run          # Execução única (CI)
pnpm test:coverage     # Com relatório de cobertura

# E2E
pnpm test:e2e          # Executa testes Playwright
```

## Cobertura

Thresholds configurados no `vitest.config.ts`:

| Métrica | Threshold |
|---------|-----------|
| Lines | 80% |
| Functions | 75% |
| Branches | 70% |
| Statements | 80% |

A cobertura cobre arquivos importados pelos testes. Componentes Astro puros são cobertos pelos testes E2E.

## Padrões de Teste

### Serviços (DB mockado)

```typescript
vi.mock('@/core/lib/db', () => ({
  db: { execute: vi.fn() },
}));

// Mock de sucesso
(db.execute as any).mockResolvedValueOnce({ rows: [...] });
// Mock de erro DB
(db.execute as any).mockRejectedValueOnce(new Error('DB error'));
// Mock de parse error (retorno malformado)
(db.execute as any).mockResolvedValueOnce({ rows: [{ coluna_invalida: 'valor' }] });
```

**Cenários obrigatórios para todo serviço:**
- **Parse error:** Dados malformados retornados do banco → serviço retorna `[]`
- **DB error:** Falha na conexão/query → serviço retorna `[]`
- **Empty results:** Query bem-sucedida sem dados → serviço retorna `[]`

### Componentes React

```typescript
import { render, screen } from '@testing-library/react';

render(<Button variant="primary">Click</Button>);
expect(screen.getByRole('button')).toBeInTheDocument();
```

### Logger

```typescript
const spy = vi.spyOn(console, 'info').mockImplementation(() => {});
logger.info('test');
expect(spy).toHaveBeenCalledWith(expect.stringContaining('test'));
```

## Boas Práticas

1. **Testes perto do código:** `__tests__/` no mesmo diretório do arquivo testado
2. **Mock de DB:** Nunca faça chamadas reais ao banco em testes
3. **Cobertura de erro:** Teste tanto sucesso quanto falha/erro
4. **Componentes React:** Teste renderização com diferentes props/variants
5. **E2E:** Teste fluxos críticos (navegação, busca, review)
