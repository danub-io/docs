---
title: "Postmortem 004: Edit tool converting self-closing JSX tag into invalid closing tag"
---

## Summary

- **Date:** 2026-05-07
- **Component:** `ComparadorInteractive.tsx` (comparison page)
- **Symptom:** Build failed with `Expected ">" but found "<"` after an automated edit replaced `/>` with `</SpecRowMobile>` without closing the opening tag
- **Severity:** Medium — Blocked the build, but only on the comparison page
- **Root cause:** The edit tool replaced `/>` with `</SpecRowMobile>` but did not add `>` to close the opening tag `<SpecRowMobile`

## Timeline

1. A request was made to increase the size of `NotaBadge` badges on the comparison page (`ComparadorInteractive.tsx`)
2. First edit (desktop): `size="md"` → `size="lg"` — successful
3. Second edit (mobile): `size="sm"` → `size="md"` — reported as successful
4. Build fails with `Expected ">" but found "<"` at `ComparadorInteractive.tsx:370:14`
5. Investigation revealed: the self-closing tag `/>` of the first `<SpecRowMobile>` was replaced with `</SpecRowMobile>`, but the opening tag `<SpecRowMobile` was left without `>`

## Symptoms

- Build fails with esbuild error: `Expected ">" but found "<"`
- TypeScript reports: `Identifier expected`, `Expected corresponding JSX closing tag for 'div'`
- The code appeared syntactically correct when read line by line
- Only the comparison page was affected

## Root Cause

The `edit` tool was called with an `oldString` that contained `</SpecRowMobile>`. The original file had `/>` (self-closing). Despite that, the tool reported success but incorrectly replaced:

**Original (valid):**
```tsx
<SpecRowMobile
  label="Crítico"
  values={produtosSlice.map((p) => (
    <NotaBadge key={p.id} score={p.nota_final} size="sm" />
  ))}
/>
```

**After edit (invalid):**
```tsx
<SpecRowMobile
  label="Crítico"
  values={produtosSlice.map((p) => (
    <NotaBadge key={p.id} score={p.nota_final} size="md" />
  ))}
</SpecRowMobile>
```

The problem: the opening tag `<SpecRowMobile` was **never closed** — it was missing `>` after the closing of the `values` prop. In the original, `/>` served both to close the opening tag and mark it as self-closing. The edit replaced `/>` with `</SpecRowMobile>` but forgot to add `>` to close the opening tag.

## Why It Was Hard to Find

| Reason | Explanation |
|-------|-----------|
| **Code looks visually correct** | `<SpecRowMobile>...</SpecRowMobile>` looks like a valid pair to the human eye |
| **Edit tool reported success** | There was no indication of editing failure |
| **esbuild error is cryptic** | `Expected ">" but found "<"` does not explicitly say an opening tag was left unclosed |

## Applied Fix

Revert `</SpecRowMobile>` back to `/>` (self-closing), keeping only the `size` change:

```diff
-              </SpecRowMobile>
+              />
```

## Verification

```bash
pnpm build
# Should complete without errors
```

## Lessons Learned

### 1. Always review the diff after automated edits

After each automated tool edit, review the diff (`git diff`) before proceeding. This would have immediately caught that `/>` was replaced with `</SpecRowMobile>`.

### 2. Self-closing vs explicit closing in JSX

React components without children **must** use self-closing `/>`. Switching to `<Tag>...</Tag>` requires adding `>` to the opening tag — it is not a direct replacement of `/>` with `</Tag>`.

### 3. Build as a safety gate

Always run `pnpm build` (or `pnpm lint`) after edits to catch syntax errors before deploying.

## Files Changed

- `ComparadorInteractive.tsx` — reverted `</SpecRowMobile>` to `/>`

## Preventive Actions

- After automated edits, review `git diff` before committing
- Be wary of edits that change tag structure (self-closing → explicit)
- Run build after any edit in JSX
