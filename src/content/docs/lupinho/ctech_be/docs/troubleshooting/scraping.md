---
title: "Web Scraping and Extraction Errors"
---

## Error: "Failed to fetch URL"

### Symptom
```
Error: Failed to fetch URL: https://... - Status 403
```

### Common Causes
1. **User-Agent Blocking:** Site detected scraping
2. **Rate Limiting:** Too many requests in a short time
3. **CAPTCHA:** Site required human verification

### Solutions
1. Check if the URL is in the safe URL list (`@/lib/scrapers.ts` - `isSafeUrl()`)
2. Adjust the request interval in M8 (Settings → Scraping Services)
3. Use Playwright with stealth plugin (already configured in the project)

---

## Error: "Extraction failed - No content found"

### Symptom
```
Scraping succeeded but AI could not extract content
```

### Solution
1. Check if the CSS selector is correct
2. The site may have changed its HTML structure
3. Increase the `timeout` in `fetch()` or Playwright

---

## Playwright not found

### Error
```
Error: playwright-chromium not found
```

### Solution
```bash
cd /home/dan/Documentos/ctech/ctech_be
pnpm exec playwright install chromium
```

---

## Rate Limiting (Google Custom Search, etc.)

### Symptom
```
429 Too Many Requests
```

### Solution
1. Configure multiple tiers in M8 (Settings → Scraping Services)
2. Increase the delay between requests
3. Use different API keys for different tiers

---

## Scraping Debug

To see the HTML being extracted:
```typescript
// In any scraping action
console.log(html.substring(0, 1000)); // Log first 1KB
```

Or check the logs at:
- M8 → System Logs (`/8-configuracoes/logs`)
- Pino log file (if configured)
