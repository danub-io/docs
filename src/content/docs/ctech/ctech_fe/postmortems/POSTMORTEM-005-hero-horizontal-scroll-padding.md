---
title: "Postmortem 005: Horizontal Scroll, Padding, and Visual Clipping"
---

# Postmortem 005: Horizontal Scroll, Padding, and Visual Clipping in the Hero

## Summary

- **Date:** 2026-05-08
- **Component:** `ctech_fe/src/modules/inicio/components/HeroHorizontal.astro`
- **Symptom:** The Hero cards were touching the screen edges (visual clipping at 0px) during horizontal scrolling, differing from the pattern of other sections that had a 16px breathing room before disappearing from view.
- **Severity:** Low — UI/UX inconsistency
- **Root cause:** Applying padding (`px-4`) *inside* the scroll container (`overflow-x-auto`) causes the container to occupy 100% of the screen, visually clipping the cards exactly at the monitor edge and often "swallowing" the right padding.

## Timeline

1. The HeroHorizontal layout needed to be adjusted to switch from a mobile carousel to horizontal cards starting at the `sm` breakpoint (640px).
2. During the adjustment, the HeroHorizontal container was detached from `layout-container` to allow it to center the cards without the 1280px maximum limit on ultra-wide screens.
3. When using full width (`w-full`), we tried to maintain edge spacing by adding `px-4` directly to the container with `overflow-x-auto`, along with `w-fit mx-auto` to try to center when there was space.
4. This produced behavior where scrolling worked, but the cards touched the screen corners instead of disappearing at 16px from the edge.
5. Attempts with `scroll-padding`, pseudo-elements (`after:w-4`), and spacers ensured the *internal* scroll padding, but visual clipping still occurred at the absolute screen edge (0px).
6. The definitive solution was found by comparing the behavior with the `RolagemHorizontal.astro` component, which clips perfectly at 16px from the edge because it sits inside a `layout-container`.

## Root Cause

The `overflow-x-auto` property applies strict visual clipping behavior to the edges of its container.
If the scroll container has `w-full` (100vw), clipping will occur at 0px of the screen, no matter if you put `px-4` inside it. The internal `px-4` only adds space at the end of the scrollable *content*, but the scroll "window" remains glued to the monitor edge.

## Solution

To achieve the illusion that the cards are scrolling and disappearing *before* reaching the screen edge (a 16px breathing room), the scroll container itself needs to be smaller than the screen.
This was done by moving the padding (`px-4`) to the `<section>` tag wrapping the flex container.

**Before (Problem):**
```html
<section class="mb-8 mt-2 w-full">
  <div class="flex overflow-x-auto px-4 ..."> <!-- Clipping at 0px -->
    <!-- cards -->
  </div>
</section>
```

**After (Solution):**
```html
<section class="mb-8 mt-2 w-full px-4"> <!-- Shrinks inner content by 32px -->
  <div class="flex overflow-x-auto ..."> <!-- Clipping at 16px -->
    <!-- cards -->
  </div>
</section>
```

With this, the `<div overflow-x-auto>` ends up with a width of the screen minus 32px. The visual clipping happens at the boundary of the `div`, which is now inset 16px from the monitor. Bonus: for giant screens where all cards fit, simply add `2xl:justify-center` to the scroll container and they will be perfectly centered without the limitation of `layout-container`.

## Lessons Learned

1. **Scroll Clipping:** If you want elements to disappear *before* the screen edge when scrolling, apply margin/padding to the scroll wrapper, not inside the scroll.
2. **Padding vs Scroll:** Internal paddings on flexible scroll containers (`px`) often fail on the right axis or cause jumps with `snap`. It is better to constrain the box from the outside.
3. **Follow the site's pattern:** `RolagemHorizontal.astro` already implemented the correct approach by default (because it sits inside a `layout-container`). Investigating how the behavior was solved elsewhere in the same codebase saves valuable time.

## Preventive Actions

- When building full-bleed scroll layouts, clearly define whether clipping should occur at the window margin (0px) or aligned with the site grid (e.g., 16px).
- Use wrappers with padding (`px-4`) instead of internal padding for all carousel/scroll components where visual clipping before the edge is desired.
