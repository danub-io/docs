---
title: "Postmortem 001: ChatInput textarea and send button misalignment"
---

# Postmortem 001: ChatInput textarea and send button misalignment

## Summary

- **Date:** 2026-05-13
- **Component:** `ChatInput.tsx`, `ChatHeader.tsx`
- **Symptom:** Textarea and send button had misaligned baselines; textarea grew upward but the button moved with it instead of staying fixed; mode dropdown in header appeared vertically offset
- **Severity:** Low (visual/UX)
- **Root Cause:** `self-start` on textarea wrapper overrode `items-end` on flex container; block-level wrapper prevented vertical centering of mode dropdown

## Timeline

1. User reported textarea and send button bases were on different lines
2. Removed `self-start` from textarea wrapper to inherit `items-end` from parent flex
3. User then reported the mode dropdown in ChatHeader was also vertically misaligned
4. Changed mode wrapper from `block` to `flex items-center`
5. User increased header padding from `py-2` to `py-4` (16px)
6. While testing, user noticed the send button moved up when textarea grew to multiple lines
7. Refactored layout: removed absolute positioning, changed to two-column `flex gap-2 items-end` with textarea `flex-1` in a wrapper with `flex flex-col justify-end`, button `shrink-0`

## Root Cause

### Problem 1 — ChatInput alignment

The textarea wrapper had `self-start` (align to top) while the button inherited `items-end` (align to bottom) from the flex container. This caused the textarea and button bases to sit on different lines. When the textarea grew through auto-resize, the button appeared to move with it because both were flex items in a single row — the flex container's height was driven by the textarea, and `items-end` kept the button at the bottom of that growing container.

### Problem 2 — ChatHeader mode button

The DropdownMenu wrapper was `hidden md:block`. As a block element inside a `flex items-center` row, the button's default vertical alignment was baseline instead of center, making it look slightly offset from "TURBO CODE" and other header elements.

## Solution

### ChatInput

Changed from a single-column absolute layout to a proper two-column flex layout:

```tsx
// Before: single container with absolute button
<div className="max-w-3xl mx-auto relative">
  <textarea ... />
  <Button className="absolute bottom-1.5 right-1.5" ... />
</div>

// After: two-column flex with items-end
<div className="max-w-3xl mx-auto flex gap-2 items-end">
  <div className="flex-1 relative flex flex-col justify-end">
    <textarea className="w-full ..." ... />
  </div>
  <Button className="shrink-0" ... />
</div>
```

### ChatHeader

Changed wrapper from block to flex:

```tsx
// Before
<div className="hidden md:block">

// After
<div className="hidden md:flex items-center">
```

## Files Changed

- `web/src/features/chat/ChatInput.tsx` — refactored to two-column flex layout with items-end
- `web/src/features/chat/ChatHeader.tsx` — changed mode button wrapper to flex items-center, increased header padding to py-4

## Lessons Learned

1. When aligning a textarea and button together, use `flex items-end` on the row and `flex flex-col justify-end` on the textarea wrapper — this keeps the button fixed at the bottom while the textarea grows upward
2. Block elements inside a flex container with `items-center` can still have baseline alignment issues — use `flex items-center` on the wrapper for reliable vertical centering
3. Always test multi-line textarea growth early in the development cycle, not just single-line

## Preventive Actions

- [ ] When creating new form inputs with adjacent buttons, use two-column flex layout with `items-end` from the start
- [ ] Verify vertical alignment of all header controls at different viewport sizes during code review
