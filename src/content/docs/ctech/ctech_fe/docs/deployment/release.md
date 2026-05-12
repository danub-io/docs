---
title: "Release Process"
description: "How releases are made and the changelog is automatically updated"
---

Production deployment is done via GitHub Actions, triggered by semantic tags.

## Flow

1. Commit following [Conventional Commits](https://www.conventionalcommits.org/)
2. When ready to publish, create a semantic tag and push:
   ```bash
   git tag v1.0.7
   git push --tags
   ```
3. GitHub Actions automatically runs:
   - **CI:** lint, typecheck, build, unit and E2E tests
   - **Deploy:** build + `wrangler deploy` → Cloudflare Workers
   - **Changelog:** the `scripts/update-changelog.sh` script (in the ctech_fe repo) generates the entry from git log and commits directly to the `danub-io/docs` repository

## Commit to Changelog Mapping

| Commit prefix | Changelog section |
|---|---|
| `feat:` | `### Added` |
| `fix:` | `### Fixed` |
| `refactor:` / `style:` | `### Changed` |
| `perf:` | `### Optimized` |
| `docs:` | `### Documentation` |
| `chore:` | Ignored (not included) |
| `merge` | Ignored (`git log --no-merges`) |

## Responsible Script

**Location:** `scripts/update-changelog.sh` in the `danub-io/ctech_fe` repository

**What it does:**

1. Reads the version from the git tag that triggered the workflow (`GITHUB_REF_NAME`)
2. Finds the previous tag with `git describe --tags --abbrev=0 HEAD~1`
3. Reads the commit log between the two tags (`git log --no-merges`)
4. Groups commits by prefix and generates the markdown block in Keep a Changelog format
5. Clones the `danub-io/docs` repository
6. Replaces the `[Unreleased]` block with the new version in `CHANGELOG.md`
7. Creates an empty `[Unreleased]` for upcoming changes
8. Commits and pushes directly to the `main` branch of the docs repo

**Runs exclusively in CI, after a successful deploy.** No manual action is required.

## Changelog

The changelog lives in `src/content/docs/ctech/ctech_fe/CHANGELOG.md` in the `danub-io/docs` repository.
