---
title: "Troubleshooting: Build"
---

## Error: "Sharp is not available"

**Cause:** Sharp (image processing) was not installed correctly.

**Solution:**
```bash
pnpm add sharp
```

If the error persists, install native dependencies:
```bash
pnpm rebuild sharp
```

## Error: "Image Optimization Failed"

**Cause:** Image URL is too long (e.g., Google Drive).

**Solution:** Download the image locally to `src/assets/images/` and use the local path.

## Error: "Unexpected token" in .astro file

**Cause:** Astro file with syntax error (unclosed tag, invalid frontmatter).

**Solution:** Check the frontmatter (`---`) and the HTML tag structure.

## Error: "Build timed out"

**Cause:** Too many dynamic pages with slow Turso queries.

**Solution:**
- Reduce the number of pages in the build
- Use ISR (Incremental Static Regeneration) instead of SSG
- Check Turso latency
