# Documentação — Central de Documentação dos Projetos

Site de documentação centralizada construído com **Astro 6 + Starlight**, hospedado em `https://danub-io.github.io/docs/`.

Reúne a documentação de todos os projetos do ecossistema em um único lugar, sincronizada automaticamente via script.

## Projetos

| Projeto | Descrição |
|---------|-----------|
| [CTech](./src/content/docs/ctech/) | Ecossistema de curadoria técnica de hardware com IA |
| [Editora](./src/content/docs/editora/) | Editora pessoal automatizada com IA para produção de livros |
| [GospelReads](./src/content/docs/gospelreads/) | Blog de conteúdo teológico e reflexões cristãs |
| [MBA Lite](./src/content/docs/mbalite/) | Landing page do curso MBA Lite |

## Como Funciona

O script `scripts/sync-docs.mjs` copia arquivos `.md` e `.mdx` de cada projeto para `src/content/docs/<projeto>/`, adicionando frontmatter automaticamente quando necessário.

### Sincronizar documentação

```bash
pnpm prebuild        # Sincroniza antes do build
node scripts/sync-docs.mjs  # Sincronizar manualmente
node scripts/sync-docs.mjs --watch  # Modo watch (dev contínuo)
```

### Desenvolvimento

```bash
pnpm install
pnpm dev             # Dev server (já roda sync automaticamente)
pnpm dev:sync        # Dev com watch de sincronização contínua
pnpm build           # Build de produção
pnpm check           # Validação Astro
```

## Adicionar Novo Projeto

1. Adicione o diretório do projeto em `scripts/sync-docs.mjs` (array `projects`)
2. Crie a entrada correspondente no `sidebar` do `astro.config.mjs`
3. Adicione um `LinkCard` em `src/content/docs/index.mdx`

## Estrutura

```
src/content/docs/
├── ctech/
├── editora/
├── gospelreads/
├── mbalite/
└── index.mdx          # Página inicial com LinkCards
```

Os conteúdos são **gerados automaticamente** pelo sync — não edite manualmente os arquivos dentro de `src/content/docs/` (suas alterações serão sobrescritas no próximo sync). Edite os arquivos-fonte nos repositórios de cada projeto.
