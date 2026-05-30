---
title: "Postmortem 001: Select dropdown causes page shrinkage on mobile"
---

## Summary

- **Date:** 2026-05-08
- **Component:** `OrdenacaoBusca` (Base UI Select) on the search page
- **Symptom:** Clicking the sort dropdown on mobile caused the page to shrink in width, revealing a white bar on the right side.
- **Severity:** Medium — only affected mobile, only during Select interaction.
- **Root cause:** Base UI's `useAnchoredPopupScrollLock` applied `overflow: hidden` to `<body>` via `useScrollLock` whenever the Select opened. On mobile, this triggered a viewport recalculation, shrinking the content.

## Timeline

1. User reported that clicking the sort selector on the search page caused the site to "shrink" and show a white bar on the right.
2. Initial investigation — CSS inspection ruled out fixed-width, overflow, or scrollbar-gutter issues.
3. Source code search in Base UI revealed the `useAnchoredPopupScrollLock` hook in `SelectPositioner`, which conditionally enables scroll lock based on `(alignItemWithTriggerActive || modal) && open`.
4. Since `alignItemWithTrigger` defaults to `true`, the scroll lock was activated on every Select open.
5. Fix: pass `alignItemWithTrigger={false}` to the `SelectContent` used by `OrdenacaoBusca`.

## Root Cause

The Base UI `Select` uses `@floating-ui` for popup positioning. The positioner includes the `useAnchoredPopupScrollLock` hook, which in turn calls `useScrollLock` from `@base-ui/utils`. This hook:

1. Detects whether the trigger element needs scroll lock.
2. Applies `overflow: hidden` to `document.body` when the popup opens.
3. On mobile (viewport < 768px), `overflow: hidden` causes viewport recalculation, shrinking the body and creating white space on the right.

Scroll lock is activated when `alignItemWithTriggerActive` is `true` (default) or `modal` is `true`.

## Solution

Add `alignItemWithTrigger={false}` to `SelectContent` in the `OrdenacaoBusca` component:

```tsx
<SelectContent align="end" alignItemWithTrigger={false}>
```

This disables the scroll lock without affecting the dropdown alignment (`align="end"` still works). The popup now uses its natural content width instead of mirroring the trigger width.

## Files changed

- `src/modules/busca/components/OrdenacaoBusca.tsx` — added `alignItemWithTrigger={false}`

## Lessons learned

1. Base UI Select activates scroll lock by default via `alignItemWithTrigger`. This is not obvious from the public API.
2. `overflow: hidden` on the body on mobile causes viewport recalculation in various browsers. Disabling scroll lock is the correct approach when the popup does not need blocked scrolling.
3. To debug this type of issue, monitoring style changes on `<body>` and `<html>` via DevTools when interacting with the component is faster than tracing the import chain in node_modules.

## Preventive actions

- When using `SelectContent` in new mobile contexts, evaluate whether scroll lock is needed. If the popup is small (not full-screen), pass `alignItemWithTrigger={false}`.
- If scroll lock is required (e.g., modal select on mobile), test on a real device to ensure the viewport does not shrink.
