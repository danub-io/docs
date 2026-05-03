---
title: "Módulo de Busca"
---



O módulo `busca` implementa busca full-text com filtros, ordenação, paginação e facetas.

## Visão Geral

A busca é **server-side** (SSR): o formulário submete query params para `/busca`, e a página Astro consulta o serviço para renderizar resultados. Sem JavaScript no cliente para a busca principal.

## Serviço

**Arquivo:** `src/modules/busca/services/servicoBusca.ts`

### Interface

```typescript
interface FiltrosBusca {
  busca: string;          // Termo buscado (mínimo 2 caracteres)
  ordem?: 'nota' | 'nome' | 'lancamento';
  categoria?: string | null;
  pagina?: number;
}

interface ResultadoBusca {
  products: Product[];
  total: number;
  pagina: number;
  totalPaginas: number;
  porPagina: number;          // 24
  query: string;
  tempoMs: number;            // Tempo de execução em ms
  categoriasDisponiveis: {    // Facetas
    nome: string;
    total: number;
  }[];
}
```

### Funcionalidades

- **Full-text:** Busca por `nome_produto`, `marca` e `categoria` (case-insensitive, LIKE)
- **Filtros:** Por categoria (via query param `categoria`)
- **Ordenação:** Por nota (`nota_final DESC`), nome (`nome_produto ASC`) ou lançamento (`lancamento DESC`)
- **Paginação:** 24 itens por página
- **Facetas:** Retorna categorias disponíveis com contagem para filtros
- **Proteção:** Mínimo 2 caracteres para buscar
- **Error handling:** Retorna resultado vazio em caso de erro (nunca quebra a página)

### Exemplo de Uso

```typescript
import { servicoBusca } from '@/modules/busca/services/servicoBusca';

const resultado = await servicoBusca.buscar({
  busca: 'notebook',
  ordem: 'nota',
  categoria: 'Notebook',
  pagina: 1,
});
```

## Componentes

| Componente | Descrição |
|-----------|-----------|
| `BarraBusca.astro` | Input de busca com valor controlado por query param |
| `FiltrosBusca.astro` | Pills de categoria para filtrar resultados |
| `FiltroAtivo.astro` | Tag de filtro ativo com botão de remover |
| `GradeResultados.astro` | Grid de cards de produtos |
| `PaginacaoBusca.astro` | Navegação de páginas |
| `ResultadosBusca.astro` | Container: título, contagem, grid, paginação |
| `DestacarTermo.astro` | Destaca o termo buscado no texto (wrap em `<mark>`) |
| `VazioBusca.astro` | Estado vazio quando nenhum resultado encontrado |

## Rota

`/busca` — Página Astro que lê query params (`q`, `categoria`, `ordem`, `pagina`), chama `servicoBusca.buscar()` e renderiza os componentes.

## Exemplos de URL

```
/busca?q=notebook
/busca?q=fone&categoria=Fone&ordem=nota
/busca?q=teclado&pagina=2
```
