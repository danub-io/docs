# Contribuindo para a Central de Documentação

## Configuração do Ambiente

```bash
git clone <repo-url>
cd docs
pnpm install
pnpm dev
```

## Fluxo de Trabalho

Toda documentação vem dos repositórios-fonte via script de sincronização:

```bash
node scripts/sync-docs.mjs              # Sincronizar manualmente
node scripts/sync-docs.mjs --watch       # Watch mode (útil em dev)
pnpm dev:sync                            # Dev + watch de sincronização
```

**NÃO edite arquivos em `src/content/docs/` diretamente** — eles são sobrescritos
a cada sincronização. Edite os arquivos-fonte no repositório do projeto correspondente.

## Adicionar Projeto Novo

1. Adicione o nome do diretório ao array `projects` em `scripts/sync-docs.mjs`
2. Adicione entrada no `sidebar` em `astro.config.mjs`
3. Adicione `LinkCard` em `src/content/docs/index.mdx`

## Validar Links

```bash
node scripts/test-links.mjs
```

## Padrões

- **Commits:** Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`)
- **Formatação:** Prettier com `prettier-plugin-astro`
