---
title: "Camada de Dados — CTECH Frontend"
---



Este documento descreve como o frontend consome, transforma e exibe dados, incluindo a conexão com o banco Turso, os serviços disponíveis e os tipos compartilhados.

## Visão Geral

O ctech_fe consulta o banco Turso **diretamente** em Server-Side Rendering (SSR) via o cliente `@libsql/client`. Não há uma camada REST API intermediária — o backend (ctech_be) escreve os dados, e o frontend os lê.

```
ctech_be (Server Actions) → Turso DB (SQLite) ← ctech_fe (Astro SSR)
```

> **Nota de Segurança:** O cliente Turso só é usado em SSR (nunca exposto ao navegador). As consultas são parametrizadas para prevenir SQL injection.

## Conexão com o Banco

**Arquivo:** `src/core/lib/db.ts`

```typescript
import { createClient } from '@libsql/client';

export const db = createClient({
  url: import.meta.env.TURSO_DATABASE_URL,
  authToken: import.meta.env.TURSO_AUTH_TOKEN || '',
});
```

**Variáveis de ambiente necessárias:**
- `TURSO_DATABASE_URL` — URL do banco Turso (obrigatório em produção e dev)
- `TURSO_AUTH_TOKEN` — Token de autenticação (obrigatório em produção)

## Serviços

Cada domínio possui um serviço que encapsula consultas SQL e transformações.

### Core Services

| Serviço | Arquivo | Funções | Descrição |
|---------|---------|---------|-----------|
| `categoryService` | `src/core/services/categoryService.ts` | `getCategories()` | Lista categorias únicas com cache em memória (TTL 5min) |

### Module Services

| Módulo | Serviço | Funções | Descrição |
|--------|---------|---------|-----------|
| **Home** | `homeService` | `getFeaturedProduct()`, `getTrendingProducts()` | Produto em destaque e tendências |
| **Laptops** | `laptopService` | `getLaptops()` | Lista filtrada de laptops aprovados |
| **Compare** | `compareService` | `getComparisonProducts(ids)`, `getTopProducts(limit)`, `getSearchSuggestions(query)` | Comparação e busca |
| **Reviews** | `reviewService` | `getReviewBySlug(slug)`, `getAllReviewSlugs()`, `getAffiliatesByProductId(productId)` | Páginas de review e afiliados |
| **Community** | `communityService` | `getLatestReviews(limit)` | Feed da comunidade |

## Tipos e Validação

### ProductSchema (`src/core/types/product.ts`)

Schema Zod que valida e transforma dados da tabela `Produtos`:

```typescript
export const ProductSchema = z.object({
  id: z.number(),
  nome_produto: z.string(),
  marca: z.string().nullable().optional(),
  specs_json: z.string().nullable().optional().default('{}'),
  // ... outros campos
}).transform((data) => ({
  ...data,
  specs: JSON.parse(data.specs_json || '{}') as Record<string, unknown>,
}));

export type Product = z.infer<typeof ProductSchema>;
```

### Tipos de Retorno

Todos os serviços seguem o padrão:
- **Sucesso:** `Promise<Product[]>` ou `Promise<Product | null>`
- **Erro:** `Promise<[]>` ou `Promise<null>` (nunca lançam exceções)

## Estratégia de Cache

### Cache em Memória (categoryService)

```typescript
let cache: { data: Category[]; timestamp: number } | null = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos
```

- Válido apenas durante a vida útil do servidor (não persiste entre restarts)
- Usado para dados que mudam com pouca frequência (categorias)

### SSR sem Cache

Os demais serviços consultam o banco a cada requisição SSR. Para melhorar performance em escala, considere:
- Adicionar cache HTTP (CDN) para páginas estáticas
- Implementar cache de query com TTL para listings
- Usar ISR (Incremental Static Regeneration) do Astro

## Boas Práticas

1. **Consultas parametrizadas:** Sempre use `?` placeholders e `args` — nunca concatene valores em SQL
2. **Tratamento de erros:** Todo serviço tem try/catch com fallback (array vazio ou null)
3. **Validação:** Use `ProductSchema.safeParse()` para dados que podem vir mal formatados
4. **Logging:** Erros são logados via `logger.error()` para debug em desenvolvimento
5. **Performance:** Use `Promise.all()` para consultas paralelas independentes
