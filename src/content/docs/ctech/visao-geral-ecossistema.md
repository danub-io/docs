---
title: "Visao Geral do Ecossistema"
description: "Fluxo completo de dados do CTECH: da ingestao no backend a exibicao no frontend"
---

Este documento descreve o fluxo completo de um produto no ecossistema CTECH, desde a entrada bruta no backend (ctech_be) ate a exibicao na pagina publica (ctech_fe).

---

## Arquitetura em Duas Camadas

```
ctech_be (Next.js + Drizzle)
    | Server Actions escrevem no banco
    v
Turso DB (SQLite distribuido)  ←  banco compartilhado
    ^
    | SSR queries leem diretamente
ctech_fe (Astro + @libsql/client)
```

Nao ha API REST intermediaria. Ambos os projetos conectam-se ao mesmo banco Turso.

---

## Pipeline de um Produto (M1-M9)

### Backend: Ingestao e Curadoria

```
Texto bruto (usuario)
    |
    v
M1 Entrada       -> IA extrai marca, nome, specs, tier. Detecta duplicidade.
    |
    v
M2 Descoberta    -> Busca links de reviews tecnicas (Google). IA filtra.
    |
    v
M3 Extracao      -> Scraping do artigo -> Markdown -> IA analisa (nota, pros, contras)
    |
    v
M4 Consolidacao  -> Agrega ate 8 reviews. Nota Bayesiana. IA sintetiza veredito.
    |              Produto marcado como 'AprovadoM4' (visivel no frontend)
    |
    v
M5 Precos        -> Busca precos (Google Shopping). IA valida modelo correto.
    |
    v
M6 Conferencia   -> Auditoria final: scraper navega no link, captura preco + estoque.
    |
    v
M7 CMS           -> CRUD do catalogo. Listagem, edicao, exclusao.
M8 Configuracoes -> Modelos IA, scraping services, logs, preferencias.
M9 Documentacao  -> Visualizador de markdown integrado.
```

### Frontend: Exibicao Publica

```
Turso DB
    | SSR queries (parametrizadas)
    v
Services (src/core/services/ ou src/modules/*/services/)
    | try/catch + safeParse Zod
    v
Paginas Astro (src/pages/)
    | frontmatter busca dados
    v
Componentes Astro/React (props -> render)
    | Astro para apresentacao, React para interatividade
    v
HTML estatico + Islands hidratadas no cliente
```

---

## Tabelas do Banco (Visao Geral)

| Tabela | Descriao | Escrita por | Leitura por |
|--------|----------|-------------|-------------|
| `Produtos` | Catalogo central de produtos | ctech_be (M1-M7) | ctech_fe |
| `Reviews` | Reviews de imprensa (critic) e usuarios (user) | ctech_be (M3) + ctech_fe | Ambos |
| `Afiliados` | Links de lojas com precos | ctech_be (M5-M6) | ctech_fe |
| `historico_precos` | Oscilacao de precos (90 dias) | ctech_be (M5) | — |
| `fila_processamento` | Jobs assincronos (M1-M6) | ctech_be | — |
| `Guias` / `Guia_Produtos` | Guias de recomendacao editoriais | ctech_be | ctech_fe |
| `config_ai_models` | Modelos IA configurados | ctech_be (M8) | ctech_be |
| `config_scraping_services` | Servicos de scraping | ctech_be (M8) | ctech_be |
| `logs_entrada` | Auditoria (tokens, custo) | ctech_be | ctech_be |
| `conflitos_entrada` | Duplicidade detectada | ctech_be (M1) | ctech_be |

> Schema completo: [schema-banco-consolidado.md](./schema-banco-consolidado.md)

---

## Servicos do Frontend (Mapa)

Cada dominio no ctech_fe possui um servico que encapsula consultas SQL.

### Core Services (src/core/services/)

| Servico | Metodos | Cache | TTL |
|---------|---------|-------|-----|
| `servicoCatalogo` | `obterCategorias()` | Sim | 5 min |
| `servicoMenu` | `obterMenu()` | Sim | 5 min |

### Module Services (src/modules/*/services/)

| Modulo | Servico | Metodos principais | Cache |
|--------|---------|--------------------|-------|
| Inicio | `servicoInicio` | `obterProdutoDestaque()`, `obterProdutosRecentes()` | 2 min |
| Produto | `servicoProduto` | `obterProdutoPorSlug()`, `obterProdutoCompleto()`, `obterAvaliacoesCriticas()`, `obterAfiliados()` | Slugs: 1h |
| Categoria | `servicoCategoria` | `obterProdutosPorCategoria()`, `obterProdutosAgrupadosPorNivel()` | — |
| Guia | `servicoGuia` | `obterGuiasPorCategoria()`, `obterGuiaPorSlug()`, `obterProdutosDoGuia()`, `obterCategoriasComGuias()` | Cats: 30min |
| Busca | `servicoBusca` | `buscar(filtros)` | — |
| Comparar | `servicoComparacao` | `obterProdutosComparacao()`, `obterTopProdutos()`, `obterSugestoesBusca()` | — |
| Comunidade | `servicoComunidade` | `obterAvaliacoesRecentes()` | — |
| Auth | `servicoAuth` | `verificarToken()`, `buscarUsuarioPorId()` | — |

> Todos os servicos retornam `[]` ou `null` em caso de erro (nunca lancam excecoes).

---

## Rotas do Frontend

| Rota | Descricao |
|------|-----------|
| `/` | Home com destaque e recentes |
| `/:categoria` | Pagina de categoria / hub de guias |
| `/:categoria/:slug` | Pagina detalhada do produto |
| `/:categoria/:slug/reviews` | Reviews de imprensa |
| `/:categoria/:slug/user-reviews` | Avaliacoes de usuarios |
| `/guia` | Indice de guias |
| `/guia/:slug` | Pagina de guia com produtos selecionados |
| `/busca?q=...` | Busca full-text com filtros e paginacao |
| `/comparar?ids=...` | Comparacao lado a lado |
| `/comunidade` | Feed da comunidade |
| `/painel` | Painel do usuario autenticado |

---

## Convencoes de Codigo para IA

Ver [convencoes.md](./convencoes.md) para padroes detalhados de:
- Nomenclatura de servicos, componentes e tipos
- Estrutura de pastas `core/` vs `modules/`
- Path aliases (`@core/*`, `@modules/*`)
- Padrao de cache com `pendingFetch`
- Tratamento de erros em servicos
