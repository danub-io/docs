---
title: "Padrão Repository - CTECH Painel"
---



## Visão Geral

O projeto utiliza o **Repository Pattern** para isolar consultas SQL das Server Actions, facilitando manutenção e testes. Os repositories estão em `src/lib/repositories/`.

## Estrutura

```
src/lib/repositories/
├── cms-repository.ts        # Operações no catálogo (M7)
├── ingestion-repository.ts  # Ingestão e conflitos (M1)
├── reviews-repository.ts    # Reviews e scraping (M2/M3)
├── prices-repository.ts     # Preços e afiliados (M5/M6)
└── settings-repository.ts   # Configurações globais
```

## Exemplo: cms-repository.ts

```typescript
import { db } from "@/lib/db";
import { eq, like, and, SQL } from "drizzle-orm";
import { produtos } from "@/db/schema";

export async function getProdutos(filters?: {
    categoria?: string;
    marca?: string;
    lancamento?: string;
}) {
    const conditions: SQL[] = [];
    
    if (filters?.categoria) {
        conditions.push(eq(produtos.categoria, filters.categoria));
    }
    if (filters?.marca) {
        conditions.push(eq(produtos.marca, filters.marca));
    }
    
    return await db
        .select()
        .from(produtos)
        .where(conditions.length > 0 ? and(...conditions) : undefined);
}
```

## Benefícios

1. **Separação de Responsabilidades:** Server Actions focam na regra de negócio, repositories no acesso a dados
2. **Reutilização:** Mesmo repository pode ser usado por múltiplas Server Actions
3. **Testabilidade:** Fácil mockar o repository em testes unitários
4. **Consistência:** Queries complexas são centralizadas e reutilizadas

## Convenções

- Nome do arquivo: `[modulo]-repository.ts`
- Funções exportadas diretamente (não uma classe estática)
- Usar Drizzle ORM para queries tipadas
- SQL bruto (`db.execute`) apenas quando Drizzle não atende
- Sempre usar `try/catch` e logar erros com `logger`
