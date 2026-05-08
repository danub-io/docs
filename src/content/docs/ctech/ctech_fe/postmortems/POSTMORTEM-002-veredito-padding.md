---
title: "Postmortem 002: Padding inconsistente na seção Veredito (layout-boxed)"
---

## Sumário

- **Data:** 2026-05-08
- **Componente:** `ProdutoVeredito.astro` na página de produto (`[categoria]/[slug].astro`)
- **Sintoma:** A seção "Veredito" usava padding de 24px (`--spacing-box-padding`) vindo da classe compartilhada `layout-boxed`, enquanto o desejado era 16px (`p-4`). Tentativas de ajuste em outras seções da página falharam porque o modelo anterior não identificou que o padding vinha de uma classe CSS global compartilhada e não do componente em si.
- **Severidade:** Baixa — apenas estética, sem quebra de funcionalidade.
- **Root cause:** A classe `layout-boxed` (definida em `global.css`) aplica `padding: var(--spacing-box-padding)` (24px) via CSS custom property. Como é uma classe utilitária compartilhada entre vários componentes de seção, alterá-la globalmente quebraria o padding das demais seções.

## Timeline

1. Usuário solicitou padding de 16px na seção "Veredito" da página de produto, sem quebrar as outras seções.
2. Tentativa anterior com outro modelo/abordagem em seção diferente da página consumiu ~1h sem sucesso — o modelo não conseguiu localizar a origem do padding.
3. Investigação identificou que:
   - `layout-boxed` é usado em `ProdutoVeredito.astro` e `ProdutoEspecificacoes.astro`.
   - `--spacing-box-padding` = 24px em `global.css`.
   - `ProdutoEspecificacoes` já faz override com `p-0`.
4. Solução aplicada em segundos: substituir `layout-boxed` pelas classes equivalentes sem o padding herdado.

## Root Cause

A classe `.layout-boxed` no `global.css` é definida como:

```css
.layout-boxed {
  @apply rounded-card bg-card ring-1 ring-foreground/10;
  padding: var(--spacing-box-padding); /* 24px */
}
```

Ela é usada em múltiplos componentes de seção na página de produto. Como o padding vem de uma CSS custom property dentro de uma classe compartilhada, não era possível simplesmente adicionar `p-4` ao lado — a precedência depende da ordem de carga do CSS, o que é frágil. A abordagem correta foi substituir a classe compartilhada pelas classes Tailwind equivalentes, permitindo controlar o padding independentemente.

## Solução

Substituir `class="layout-boxed"` por `class="rounded-card bg-card ring-1 ring-foreground/10 p-4"` no componente `ProdutoVeredito.astro`:

**Antes:**
```astro
<div class="layout-boxed">
```

**Depois:**
```astro
<div class="rounded-card bg-card ring-1 ring-foreground/10 p-4">
```

Isso preserva todos os estilos visuais (cantos arredondados, fundo, borda) mas troca o padding de 24px para 16px. As demais seções que usam `layout-boxed` não são afetadas.

## Arquivos alterados

- `src/modules/produto/components/ProdutoVeredito.astro` — linha 24: `layout-boxed` → classes explícitas com `p-4`

## Lições aprendidas

1. `layout-boxed` é uma classe compartilhada com padding via CSS custom property. Alterar globalmente quebra outras seções. O padrão correto é desacoplar (inline as classes necessárias) ou criar uma variante.
2. Ao precisar de padding diferente em um componente que usa `layout-boxed`, substitua pelas classes Tailwind equivalentes + o padding desejado, em vez de tentar sobrescrever.
3. `ProdutoEspecificacoes` já usava `layout-boxed p-0` — confirmando que outras seções já precisavam de padding diferente e usavam override. Isso é um code smell de que `layout-boxed` deveria talvez ser separado em `layout-boxed` (sem padding) + `layout-box-padding` (com o padding default).
4. Para debug de padding, inspecionar o elemento no DevTools e verificar de onde vem o valor computado é mais rápido que buscar na base de código.

## Ações preventivas

- Ao criar novos componentes de seção na página de produto, considerar se `layout-boxed` é adequado ou se classes inline são melhores para evitar acoplamento de padding.
- Se houver uma terceira seção precisando de padding diferente, vale a pena refatorar: separar `layout-boxed` em uma classe sem padding e aplicar `layout-box-padding` (já existe) seletivamente.
