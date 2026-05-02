---
title: "Troubleshooting: Build"
---



## Erro: "Sharp is not available"

**Causa:** Sharp (processamento de imagens) não foi instalado corretamente.

**Solução:**
```bash
pnpm add sharp
```

Se o erro persistir, instale as dependências nativas:
```bash
pnpm rebuild sharp
```

## Erro: "Image Optimization Failed"

**Causa:** URL de imagem muito longa (ex: Google Drive).

**Solução:** Baixe a imagem localmente para `src/assets/images/` e use o caminho local.

## Erro: "Unexpected token" em arquivo .astro

**Causa:** Arquivo Astro com syntax error (tag não fechada, frontmatter inválido).

**Solução:** Verifique o frontmatter (`---`) e a estrutura de tags HTML.

## Erro: "Build timed out"

**Causa:** Muitas páginas dinâmicas com consultas lentas ao Turso.

**Solução:**
- Reduza o número de páginas no build
- Use ISR (Incremental Static Regeneration) em vez de SSG
- Verifique a latência do Turso
