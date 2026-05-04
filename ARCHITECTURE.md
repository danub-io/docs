# Arquitetura da Central de Documentação

## Visão Geral

Site de documentação centralizada construído com **Astro 6 + Starlight**. Reúne a documentação de todos os projetos do ecossistema em um único lugar, servido em `https://danub-io.github.io/docs/`.

```
Projetos fonte → sync-docs.mjs → src/content/docs/ → Starlight → dist/
```

## Stack

- **Framework:** Astro 6 (SSG)
- **Tema:** Starlight (tema de documentação oficial do Astro)
- **Conteúdo:** Content Collections (MDX)
- **Estilo:** Tailwind CSS (via Starlight) + CSS customizado (`src/styles/`)
- **Gerenciador:** pnpm

## Fluxo de Sincronização

O script `scripts/sync-docs.mjs` é o coração do pipeline:

1. Para cada projeto em `projects` (`ctech`, `editora`, `gospelreads`, `mbalite`), percorre recursivamente o diretório do projeto em busca de arquivos `.md` e `.mdx`
2. Ignora diretórios (`node_modules`, `.git`, `dist`, etc.) e arquivos específicos (`AGENTS.md`, `GEMINI.md`)
3. Copia cada arquivo para `src/content/docs/<projeto>/`, preservando a estrutura de diretórios relativa
4. Adiciona frontmatter automaticamente se o arquivo não tiver (`title` extraído do H1 ou nome do arquivo)

**Importante:** Arquivos em `src/content/docs/` são gerados automaticamente e **não devem ser editados manualmente** — serão sobrescritos na próxima sincronização.

### Comandos

| Comando | Descrição |
|---------|-----------|
| `pnpm prebuild` | Sincroniza antes do build |
| `node scripts/sync-docs.mjs` | Sincronizar manualmente |
| `node scripts/sync-docs.mjs --watch` | Modo watch (dev contínuo) |
| `pnpm dev` | Dev server (roda sync integrado) |
| `pnpm dev:sync` | Dev com watch de sincronização contínua |
| `pnpm build` | Build de produção |

## Estrutura de Diretórios

```
├── scripts/
│   ├── sync-docs.mjs       # Pipeline de sincronização
│   └── test-links.mjs      # Validação de links
├── src/
│   ├── assets/             # Imagens e arquivos estáticos
│   ├── content/
│   │   └── docs/           # Documentação (GERADA — não editar)
│   │       ├── ctech/
│   │       ├── editora/
│   │       ├── gospelreads/
│   │       ├── mbalite/
│   │       └── index.mdx   # Página inicial com LinkCards
│   └── styles/
│       ├── theme.css       # Customização de tema Starlight
│       └── layout.css      # Ajustes de layout
├── astro.config.mjs        # Config Starlight + sidebar
├── CONTRIBUTING.md
├── CHANGELOG.md
├── README.md
└── AGENTS.md
```

## Sidebar

A sidebar é configurada em `astro.config.mjs` usando a opção `sidebar` do Starlight:

```js
sidebar: [
  { label: '🏠 Início', slug: 'index' },
  { label: '💻 CTech', autogenerate: { directory: 'ctech' } },
  { label: '📖 Editora', autogenerate: { directory: 'editora' } },
  { label: '✝️ GospelReads', autogenerate: { directory: 'gospelreads' } },
  { label: '🎓 MBA Lite', autogenerate: { directory: 'mbalite' } },
]
```

Cada entrada com `autogenerate` constrói automaticamente sub-itens a partir dos arquivos encontrados no diretório correspondente dentro de `src/content/docs/`.

### Adicionar Novo Projeto

1. Adicione o nome do diretório ao array `projects` em `scripts/sync-docs.mjs`
2. Adicione entrada no `sidebar` em `astro.config.mjs` (com `autogenerate` apontando para o diretório)
3. Adicione um `LinkCard` em `src/content/docs/index.mdx`

## Personalização Visual

- **Tema:** Customizado via `src/styles/theme.css` (variáveis CSS do Starlight)
- **Layout:** Ajustes em `src/styles/layout.css`
- **Configuração geral:** `astro.config.mjs` (título, base URL, plugins)

## Validação

O script `scripts/test-links.mjs` verifica links quebrados na documentação:

```bash
node scripts/test-links.mjs
```
