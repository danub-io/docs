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

| Serviço | Arquivo | Funções | Cache | Descrição |
|---------|---------|---------|-------|-----------|
| `servicoCatalogo` | `src/core/services/servicoCatalogo.ts` | `obterCategorias()` | 5 min | Lista categorias únicas |
| `servicoMenu` | `src/core/services/servicoMenu.ts` | `obterMenu()` | 5 min | Menu de navegação com subcategorias |
| `servicoProduto` | `src/modules/produto/services/servicoProduto.ts` | `obterTodosSlugs()` | 1h | Slugs de produtos para pré-renderização |
| `servicoGuia` | `src/modules/guia/services/servicoGuia.ts` | `obterCategoriasComGuias()` | 30 min | Categorias com pelo menos 1 guia ativo |

### Module Services

| Módulo | Serviço | Funções | Cache | Descrição |
|--------|---------|---------|-------|-----------|
| **Início** | `servicoInicio` | `obterProdutoDestaque()`, `obterProdutosRecentes()` | 2 min | Produto em destaque e recentes |
| **Comparar** | `servicoComparacao` | `obterProdutosComparacao(ids)`, `obterTopProdutos(limit)`, `obterSugestoesBusca(query)` | — | Comparação e busca |
| **Categoria** | `servicoCategoria` | `obterProdutosPorCategoria(categoria, filtros?)`, `obterProdutosAgrupadosPorNivel(categoria, filtros?)`, `obterRotuloNivel(tier)` | — | Páginas de categoria |
| **Busca** | `servicoBusca` | `buscar(filtros)` | — | Busca full-text com paginação e facetas |
| **Produto** | `servicoProduto` | `obterProdutoPorSlug(slug)`, `obterTodosSlugs()`, `obterAvaliacoesCriticas(produtoId)`, `obterAvaliacoesUsuarios(produtoId)`, `obterAfiliados(produtoId)`, `obterProdutoCompleto(slug)` | — (1h slugs) | Páginas de produto, reviews, afiliados e função agregada |
| **Guia** | `servicoGuia` | `obterGuiasPorCategoria(categoria)`, `obterGuiaPorSlug(slug)`, `obterProdutosDoGuia(guiaId)`, `obterTodosGuiasAtivos()`, `obterCategoriasComGuias()` | — (30min cats) | Guias de recomendação |
| **Comunidade** | `servicoComunidade` | `obterAvaliacoesRecentes(limit)` | — | Feed da comunidade |

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

### Outros Schemas Zod

| Schema | Arquivo | Uso |
|--------|---------|-----|
| `AvaliacaoSchema` | `src/core/types/avaliacao.ts` | Reviews de imprensa e usuários |
| `AvaliacaoComunidadeSchema` | `src/core/types/avaliacao.ts` | Review com nome do produto (JOIN) |
| `GuiaSchema` | `src/core/types/guia.ts` | Guia de recomendação |
| `GuiaProdutoSchema` | `src/core/types/guia.ts` | Relação guia ↔ produto |
| `CategoriaSchema` | `src/core/services/servicoCatalogo.ts` | Categoria de produto |
| `AfiliadoSchema` | `src/modules/produto/services/servicoProduto.ts` | Afiliado (loja, preço, link) |

### Tipos de Retorno

Todos os serviços seguem o padrão:
- **Sucesso:** `Promise<Product[]>` ou `Promise<Product | null>`
- **Erro:** `Promise<[]>` ou `Promise<null>` (nunca lançam exceções)

## Estratégia de Cache

### Cache em Memória com Proteção contra Stampede

O projeto utiliza cache em memória com TTL em serviços específicos. Para evitar **cache stampede** (múltiplas requisições batendo no banco simultaneamente quando o cache expira), cada cache compartilha uma `pendingFetch` entre requisições concorrentes:

```typescript
// Padrão de implementação (ex: servicoCatalogo)
let cached: Categoria[] | null = null;
let lastFetch = 0;
let pendingFetch: Promise<Categoria[]> | null = null;
const TTL = 5 * 60 * 1000;

async obterDados() {
  if (cached && Date.now() - lastFetch < TTL) return cached;
  if (!pendingFetch) {
    pendingFetch = (async () => {
      try {
        const result = await db.execute(...);
        cached = result;
        lastFetch = Date.now();
        return cached;
      } catch {
        return cached || fallback;
      } finally {
        pendingFetch = null;
      }
    })();
  }
  return pendingFetch; // Reusa promise em andamento
}
```

| Serviço | Métodos cacheados | TTL |
|---------|-------------------|-----|
| `servicoCatalogo` | `obterCategorias()` | 5 min |
| `servicoMenu` | `obterMenu()` | 5 min |
| `servicoProduto` | `obterTodosSlugs()` | 1h |
| `servicoGuia` | `obterCategoriasComGuias()` | 30 min |
| `servicoInicio` | `obterProdutoDestaque()`, `obterProdutosRecentes()` | 2 min |

Cache é invalidado apenas no restart do servidor. Dados dinâmicos (produto, reviews, afiliados) não usam cache — consultam o banco a cada requisição SSR.

### SSR sem Cache

Os demais serviços consultam o banco a cada requisição SSR. Para melhorar performance em escala, considere:
- Adicionar cache HTTP (CDN) para páginas estáticas
- Implementar cache de query com TTL para listings
- Usar ISR (Incremental Static Regeneration) do Astro

## Boas Práticas

1. **Consultas parametrizadas:** Sempre use `?` placeholders e `args` — nunca concatene valores em SQL
2. **Tratamento de erros:** Todo serviço tem try/catch com fallback (array vazio ou null)
3. **Validação:** Use `Schema.safeParse()` para dados que podem vir mal formatados
4. **Logging:** Erros são logados via `logger.error()` para debug em desenvolvimento
5. **Performance:** Use `Promise.all()` para consultas paralelas independentes
6. **Cache stampede:** Sempre use `pendingFetch` compartilhado quando implementar cache em memória
