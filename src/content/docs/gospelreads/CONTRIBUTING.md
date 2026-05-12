---
title: "Contributing — GospelReads"
---



Thanks for contributing!

## Environment Setup

```bash
git clone <repo-url>
cd gospelreads
pnpm install
pnpm dev
```

## Standards

- **TypeScript:** Strict mode
- **Linting:** `pnpm astro check`
- **Commits:** Conventional Commits (`feat:`, `fix:`, `docs:`, `style:`)

## Creating a New Post

1. Create a `.md` file in `src/content/posts/`
2. Add frontmatter with `title`, `description`, `date`
3. Write the content in Markdown
4. Run `pnpm dev` to preview the result

## PR Process

1. Create a branch from `main`
2. Make your changes
3. Open a PR describing the changes
