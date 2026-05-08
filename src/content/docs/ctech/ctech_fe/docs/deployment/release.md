---
title: "Release Process"
description: "Como releases são feitos e o changelog é atualizado automaticamente"
---

O deploy para produção é feito via GitHub Actions, disparado por tags semânticas.

## Fluxo

1. Faça commits seguindo [Conventional Commits](https://www.conventionalcommits.org/)
2. Quando estiver pronto para publicar, crie uma tag semântica e faça push:
   ```bash
   git tag v1.0.7
   git push --tags
   ```
3. O GitHub Actions executa automaticamente:
   - **CI:** lint, typecheck, build, testes unitários e E2E
   - **Deploy:** build + `wrangler deploy` → Cloudflare Workers
   - **Changelog:** o script `scripts/update-changelog.sh` (no repositório ctech_fe) gera a entry a partir do git log e commit direto no repositório `danub-io/docs`

## Mapeamento Commit → Changelog

| Prefixo do commit | Seção no changelog |
|---|---|
| `feat:` | `### Adicionado` |
| `fix:` | `### Corrigido` |
| `refactor:` / `style:` | `### Alterado` |
| `perf:` | `### Otimizado` |
| `docs:` | `### Documentação` |
| `chore:` | Ignorado (não entra) |
| `merge` | Ignorado (`git log --no-merges`) |

## Script responsável

**Localização:** `scripts/update-changelog.sh` no repositório `danub-io/ctech_fe`

**O que faz:**

1. Lê a versão da git tag que disparou o workflow (`GITHUB_REF_NAME`)
2. Descobre a tag anterior com `git describe --tags --abbrev=0 HEAD~1`
3. Lê o log de commits entre as duas tags (`git log --no-merges`)
4. Agrupa commits por prefixo e gera o bloco markdown no formato Keep a Changelog
5. Clona o repositório `danub-io/docs`
6. Substitui o bloco `[Unreleased]` pela nova versão no `CHANGELOG.md`
7. Cria um `[Unreleased]` vazio para as próximas mudanças
8. Commit e push direto na branch `main` do repositório docs

**Roda exclusivamente no CI, após o deploy bem-sucedido.** Nenhuma ação manual é necessária.

## Changelog

O changelog vive em `src/content/docs/ctech/ctech_fe/CHANGELOG.md` no repositório `danub-io/docs`.
