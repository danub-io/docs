---
title: "Convencoes de Codigo para Desenvolvimento com IA"
description: "Padroes de nomenclatura, estrutura e tratamento de erros para geracao de codigo consistente"
---

Este documento define as convencoes do ecossistema CTECH para que ferramentas de IA gerem codigo consistente com o resto do projeto.

## ShadCN UI

- **Style:** `base-nova` (tema claro/escuro via `next-themes` ou `astro-themes`)
- **Primitives:** `@base-ui/react` (MUI) — **não** Radix
- **Instalação:** `pnpm dlx shadcn@latest add <componente> -y`
- **Variants:** usar `cn()` de `@/lib/utils` para combinar classes Tailwind
- **Customização:** evitar sobrescrever classes base do ShadCN; usar `className` para extensão

---

## Estrutura de Pastas (ctech_fe)

```
src/
  core/          # Infraestrutura global (NUNCA alterar sem necessidade extrema)
    ui/          # Componentes ShadCN (button, card, badge, etc.)
    layouts/     # Layout, Navbar, Footer
    lib/         # db.ts, cache.ts, logger.ts, cn.ts, corNota.ts
    services/    # servicoCatalogo.ts, servicoMenu.ts
    styles/      # CSS global + design tokens Tailwind v4
    types/       # Schemas Zod e tipos TS (product.ts, avaliacao.ts, guia.ts)
  modules/       # Dominios de negocio isolados (ALTERAR AQUI)
    inicio/      # Pagina inicial
    produto/     # Paginas de produto
    categoria/   # Paginas de categoria
    guia/        # Guias de recomendacao
    busca/       # Busca full-text
    comparar/    # Comparacao de produtos
    comunidade/  # Feed da comunidade
    auth/        # Autenticacao
    rolagem_horizontal/  # Carrossel horizontal
  pages/         # Rotas Astro (camada fina, apenas orquestra dados -> componentes)
    api/auth/    # Endpoints de autenticacao (REST JSON)
```

---

## Padroes de Nomenclatura

### Arquivos

| Tipo | Padrao | Exemplo |
|------|--------|---------|
| Servico | `servico[Nome].ts` | `servicoProduto.ts`, `servicoBusca.ts` |
| Componente Astro | `[Nome].astro` | `ProdutoDestaque.astro`, `CardGuia.astro` |
| Componente React | `[Nome].tsx` | `NotaBadge.tsx`, `LoginDialog.tsx` |
| Schema Zod | Em arquivo de tipos | `ProductSchema` em `product.ts` |
| Teste | `__tests__/[nome].test.ts` | `__tests__/servicoProduto.test.ts` |
| Repository (BE) | `[modulo]-repository.ts` | `cms-repository.ts` |

### Funcoes e Metodos

| Contexto | Padrao | Exemplo |
|----------|--------|---------|
| Servicos (busca) | `obter*()` | `obterProdutoPorSlug()`, `obterCategorias()` |
| Servicos (mutacao) | `criar*()`, `atualizar*()`, `deletar*()` | `criarAvaliacao()` |
| Server Actions (BE) | `processar*()`, `get*()`, `salvar*()` | `processarIngestao()`, `getAIModels()` |
| Repositories (BE) | `get*()`, `update*()`, `delete*()` | `getProdutos()`, `updateProduto()` |

### Path Aliases

```json
{
  "@/*": ["./src/*"],
  "@core/*": ["./src/core/*"],
  "@modules/*": ["./src/modules/*"]
}
```

Sempre use aliases em vez de caminhos relativos profundos:
```typescript
// Correto
import { servicoProduto } from "@modules/produto/services/servicoProduto";
import { db } from "@core/lib/db";

// Errado
import { servicoProduto } from "../../modules/produto/services/servicoProduto";
```

---

## Conexao com Banco

### ctech_fe (leitura SSR)

```typescript
// src/core/lib/db.ts
import { createClient } from "@libsql/client";
export const db = createClient({
  url: import.meta.env.TURSO_DATABASE_URL || process.env.TURSO_DATABASE_URL || "",
  authToken: import.meta.env.TURSO_AUTH_TOKEN || process.env.TURSO_AUTH_TOKEN || "",
});
```

O cliente Turso so e usado em SSR. Nunca importe `db.ts` em componentes React.

### ctech_be (leitura e escrita)

Usa Drizzle ORM (`src/db/schema.ts`) + `@/lib/db` para queries diretas quando necessario.

---

## Tratamento de Erros em Servicos (ctech_fe)

Todo servico segue este padrao:

```typescript
export async function obterDados(): Promise<Produto[]> {
  try {
    const result = await db.execute({ sql: "SELECT * FROM ...", args: [...] });
    return result.rows.map(row => ProductSchema.parse(row));
  } catch (error) {
    logger.error("Erro ao obter dados", error);
    return []; // Nunca lanca excecao
  }
}
```

**Regras:**
- Sucesso: retorna dados tipados
- Erro de parse: retorna `[]` ou `null`
- Erro de banco: retorna `[]` ou `null`
- Resultado vazio: retorna `[]` ou `null`
- Nunca use `throw` em servicos (a pagina nunca deve quebrar)

---

## Validacao com Zod

Sempre use `safeParse()` em vez de `parse()` para dados que podem vir mal formatados:

```typescript
const parsed = ProductSchema.safeParse(row);
if (!parsed.success) {
  logger.warn("Produto mal formatado", { row, error: parsed.error });
  return null; // ou pula o item
}
return parsed.data;
```

---

## Padrao de Cache com Protecao contra Stampede

```typescript
let cached: Tipo | null = null;
let lastFetch = 0;
let pendingFetch: Promise<Tipo> | null = null;
const TTL = 5 * 60 * 1000;

async function obterDados(): Promise<Tipo> {
  if (cached && Date.now() - lastFetch < TTL) return cached;
  if (!pendingFetch) {
    pendingFetch = (async () => {
      try {
        const data = await buscarNoBanco();
        cached = data;
        lastFetch = Date.now();
        return data;
      } catch (error) {
        logger.error("Falha no cache", error);
        return cached || []; // fallback para dados antigos ou vazio
      } finally {
        pendingFetch = null;
      }
    })();
  }
  return pendingFetch; // Reusa promise em andamento (stampede protection)
}
```

Cache e sempre in-memory (Map), nunca compartilhado entre instancias.

---

## Consultas SQL

Sempre parametrizadas:

```typescript
// Correto
await db.execute({
  sql: "SELECT * FROM Produtos WHERE categoria = ? AND status = ?",
  args: [categoria, "AprovadoM4"],
});

// Errado (SQL injection)
await db.execute(`SELECT * FROM Produtos WHERE categoria = '${categoria}'`);
```

---

## Testes (ctech_fe)

### Mock de Banco

```typescript
vi.mock("@/core/lib/db", () => ({
  db: { execute: vi.fn() },
}));

// Sucesso
(db.execute as any).mockResolvedValueOnce({ rows: [...] });
// Erro
(db.execute as any).mockRejectedValueOnce(new Error("DB error"));
// Parse error (retorno malformado)
(db.execute as any).mockResolvedValueOnce({ rows: [{ coluna_invalida: "valor" }] });
```

### Cenarios obrigatorios para todo servico testado:
- Parse error: dados malformados -> servico retorna `[]`
- DB error: falha na conexao -> servico retorna `[]`
- Empty results: query sem dados -> servico retorna `[]`

---

## Componentes: Astro vs React

| Situacao | Usar |
|----------|------|
| Conteudo estatico (listas, grids, headers) | **Astro** (zero JS) |
| Estado local, eventos, hooks | **React** com `client:*` |
| Hidratacao imediata (critico) | `client:load` |
| Abaixo da dobra | `client:visible` (preferido) |
| Nao urgente | `client:idle` |

Componentes UI (Badge, Button, Card, Progress) sao React mas renderizam em SSR sem `client:*`.

---

## Comandos

### ctech_fe

| Comando | Descricao |
|---------|-----------|
| `pnpm dev` | Servidor dev (localhost:4321) |
| `pnpm build` | Build de producao |
| `pnpm preview` | Preview do build |
| `pnpm test:run` | Testes unitarios (execucao unica) |
| `pnpm test:coverage` | Testes com cobertura |
| `pnpm test:e2e` | Testes E2E (Playwright) |
| `pnpm lint` | ESLint |
| `pnpm format` | Prettier |
| `pnpm deploy` | Deploy via wrangler |

### ctech_be

| Comando | Descricao |
|---------|-----------|
| `pnpm dev` | Servidor dev (localhost:3001) |
| `pnpm build` | Build de producao |
| `pnpm test:run` | Testes unitarios |
| `pnpm lint` | ESLint |
| `pnpm db:generate` | Gerar migracoes Drizzle |
| `pnpm db:push` | Aplicar migracoes |
| `pnpm db:studio` | Drizzle Studio |

---

## Middleware e Content Security Policy (CSP)

O middleware em `src/middleware.ts` aplica headers de segurança em todas as rotas não-asset.

### CSP bloqueia inline scripts do Astro

A política `script-src 'self'` no middleware **bloqueia os inline scripts** que o Astro usa para hidratação de componentes React (`<astro-island>`, definição de `Astro.load`, etc.).

**Sintoma:** Todos os islands React com `client:load` falham silenciosamente — o HTML SSR é renderizado mas os componentes nunca hidratam. Nenhum erro visível no console do navegador, apenas avisos de CSP no console.

**Diagnóstico:** Verificar se `<astro-island>` mantém o atributo `ssr` após carregamento da página. Se sim, a hidratação não ocorreu. Usar devtools ou `page.evaluate(() => document.querySelector('astro-island').hasAttribute('ssr'))`.

**Fix:** Adicionar `'unsafe-inline'` ao `script-src`:
```
script-src 'self' 'unsafe-inline'
```

**Localização do código:** `src/middleware.ts:180`

---

## Idiomas no Codigo

- **Nomes de servicos, componentes e variaveis:** portugues (`obterProdutoPorSlug`, `servicoCatalogo`)
- **Codigo (palavras-chave, tipos):** ingles (`interface`, `Promise`, `ProductSchema`)
- **Comentarios e documentacao:** portugues

---

## Manutenção da Documentação

Sempre que fizer alterações significativas, atualize a documentação correspondente:

- Novo serviço/busca → atualizar `docs/architecture/busca.md`
- Novo componente → atualizar `docs/architecture/components.md`
- Nova rota/arquitetura → atualizar `docs/architecture/` relevante
- Novo schema/tabela → atualizar `schema-banco-consolidado.md`
- Variável de ambiente → atualizar `docs/deployment/environment.md`
- Bug não trivial → criar postmortem em `postmortems/`
- Novo documento de arquitetura → adicionar `Contem:` inline no SKILL.md (`~/.config/kilo/skills/contexto-ctech/SKILL.md`) logo após o(s) `Leia` da seção correspondente. Formato: 1 linha, max 80 chars, separado por vírgulas. Ex: `Contem: OpenTelemetry, tracing, metrics, alertas`
