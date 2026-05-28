---
title: "Repository Pattern - CTECH Panel"
---

## Overview

The project uses the **Repository Pattern** to isolate SQL queries from Server Actions, making maintenance and testing easier. Repositories are located in `src/lib/repositories/`.

## Structure

```
src/lib/repositories/
├── cms-repository.ts        # Catalog operations (M7)
├── ingestion-repository.ts  # Ingestion and conflicts (M1)
├── reviews-repository.ts    # Reviews and scraping (M2/M3)
├── prices-repository.ts     # Prices and affiliates (M5/M6)
└── settings-repository.ts   # Global settings
```

## Example: cms-repository.ts

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

## Benefits

1. **Separation of Concerns:** Server Actions focus on business logic, repositories on data access
2. **Reusability:** The same repository can be used by multiple Server Actions
3. **Testability:** Easy to mock the repository in unit tests
4. **Consistency:** Complex queries are centralized and reused

## Conventions

- File name: `[module]-repository.ts`
- Functions are exported directly (not as a static class)
- Use Drizzle ORM for typed queries
- Raw SQL (`db.execute`) only when Drizzle doesn't support it
- Always use `try/catch` and log errors with `logger`
