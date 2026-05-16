---
title: "Postmortem 002: Inconsistent padding in the Veredito section (layout-boxed)"
---

## Summary

- **Date:** 2026-05-08
- **Component:** `ProdutoVeredito.astro` on the product page (`[categoria]/[slug].astro`)
- **Symptom:** The "Veredito" section used 24px padding (`--spacing-box-padding`) from the shared `layout-boxed` class, while 16px (`p-4`) was desired. Previous attempts to adjust padding in other sections failed because the earlier approach did not identify that the padding came from a shared global CSS class rather than the component itself.
- **Severity:** Low — cosmetic only, no functionality broken.
- **Root cause:** The `layout-boxed` class (defined in `global.css`) applies `padding: var(--spacing-box-padding)` (24px) via CSS custom property. Since it is a shared utility class used by multiple section components, changing it globally would break the padding of other sections.

## Timeline

1. User requested 16px padding in the "Veredito" section of the product page, without breaking other sections.
2. A previous attempt with a different model/approach on another section consumed ~1h without success — the model could not locate the padding origin.
3. Investigation identified that:
   - `layout-boxed` is used in `ProdutoVeredito.astro` and `ProdutoEspecificacoes.astro`.
   - `--spacing-box-padding` = 24px in `global.css`.
   - `ProdutoEspecificacoes` already overrides with `p-0`.
4. Fix applied in seconds: replace `layout-boxed` with equivalent classes without the inherited padding.

## Root Cause

The `.layout-boxed` class in `global.css` is defined as:

```css
.layout-boxed {
  @apply rounded-card bg-card ring-1 ring-foreground/10;
  padding: var(--spacing-box-padding); /* 24px */
}
```

It is used by multiple section components on the product page. Since the padding comes from a CSS custom property inside a shared class, simply adding `p-4` alongside was not reliable — the precedence depends on CSS load order, which is fragile. The correct approach was to replace the shared class with equivalent Tailwind classes, allowing independent padding control.

## Solution

Replace `class="layout-boxed"` with `class="rounded-card bg-card ring-1 ring-foreground/10 p-4"` in `ProdutoVeredito.astro`:

**Before:**
```astro
<div class="layout-boxed">
```

**After:**
```astro
<div class="rounded-card bg-card ring-1 ring-foreground/10 p-4">
```

This preserves all visual styles (rounded corners, background, border) but swaps padding from 24px to 16px. Other sections using `layout-boxed` remain unaffected.

## Files changed

- `src/modules/produto/components/ProdutoVeredito.astro` — line 24: `layout-boxed` → explicit classes with `p-4`

## Lessons learned

1. `layout-boxed` is a shared class with padding via CSS custom property. Changing it globally breaks other sections. The correct pattern is to decouple (inline the necessary classes) or create a variant.
2. When a component using `layout-boxed` needs different padding, replace it with equivalent Tailwind classes plus the desired padding, rather than attempting to override.
3. `ProdutoEspecificacoes` already used `layout-boxed p-0` — confirming that other sections already needed different padding and used overrides. This is a code smell suggesting `layout-boxed` should perhaps be split into `layout-boxed` (no padding) + `layout-box-padding` (with default padding).
4. For padding debugging, inspecting the element in DevTools and checking the computed value origin is faster than searching the codebase.

## Preventive actions

- When creating new section components on the product page, consider whether `layout-boxed` is suitable or if inline classes are better to avoid padding coupling.
- If a third section needs different padding, consider refactoring: split `layout-boxed` into a padding-free class and apply `layout-box-padding` (already exists) selectively.
