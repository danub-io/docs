# Docs — Convenções para Agentes de IA

## Stack
- **Framework:** Astro + Starlight
- **Componentes:** Starlight built-in (MDX)
- **Estilo:** Tailwind (via Starlight)
- **Gerenciador:** pnpm

## Comandos

| Comando              | Descrição                         |
| -------------------- | --------------------------------- |
| `pnpm dev`           | Servidor dev                      |
| `pnpm build`         | Build de produção                 |
| `pnpm preview`       | Preview do build                  |
| `pnpm check`         | Astro check (types)               |
| `pnpm format`        | Prettier                          |
| `pnpm format:check`  | Verificar formatação              |

## Aliases
- `@/*` mapeado para `./src/*`

## Estrutura
```
src/
├── content/docs/     # Documentação em MDX (Content Collections)
├── assets/           # Imagens, arquivos
└── ...               # Config Starlight
scripts/              # Sync de documentação externa
```

## Convenções
- **Idioma:** Português brasileiro
- **Sidebar:** configurada em `astro.config.mjs`
- **Commits:** Conventional Commits
