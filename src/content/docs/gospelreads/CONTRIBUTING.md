---
title: "Contribuindo para o GospelReads"
---



Obrigado por contribuir!

## Configuração do Ambiente

```bash
git clone <repo-url>
cd gospelreads
pnpm install
pnpm dev
```

## Padrões

- **TypeScript:** Strict mode
- **Linting:** `pnpm astro check`
- **Commits:** Conventional Commits (`feat:`, `fix:`, `docs:`, `style:`)

## Criar Novo Post

1. Crie um arquivo `.md` em `src/content/posts/`
2. Adicione frontmatter com `title`, `description`, `date`
3. Escreva o conteúdo em Markdown
4. Execute `pnpm dev` para ver o resultado

## Processo de PR

1. Crie branch a partir da `main`
2. Faça as alterações
3. Abra o PR descrevendo as mudanças
