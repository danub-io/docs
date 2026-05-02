---
title: "Contribuindo para o MBA Lite"
---



## Configuração

```bash
git clone <repo-url>
cd mbalite
pnpm install
pnpm dev
```

## Padrões

- **TypeScript:** Strict mode
- **Commits:** Conventional Commits
- **Componentes:** Prefira `.astro` para componentes estáticos, React apenas para interatividade
- **Estilos:** Use `@theme` do Tailwind v4 em `global.css`

## Processo

1. Crie branch a partir da `main`
2. Faça as alterações
3. Abra o PR descrevendo as mudanças
