---
title: "Erros em Web Scraping e Extração"
---



## Erro: "Failed to fetch URL"

### Sintoma
```
Error: Failed to fetch URL: https://... - Status 403
```

### Causas Comuns
1. **Bloqueio por User-Agent:** Site detectou scraping
2. **Rate Limiting:** Muitas requisições em pouco tempo
3. **CAPTCHA:** Site exigiu verificação humana

### Soluções
1. Verifique se o URL está na lista de URLs seguras (`@/lib/scrapers.ts` - `isSafeUrl()`)
2. Ajuste o intervalo entre requisições no M8 (Configurações → Scraping Services)
3. Use Playwright com stealth plugin (já configurado no projeto)

---

## Erro: "Extraction failed - No content found"

### Sintoma
```
Scraping realizado mas IA não conseguiu extrair conteúdo
```

### Solução
1. Verifique se o seletor CSS está correto
2. O site pode ter mudado a estrutura (HTML)
3. Aumente o `timeout` no `fetch()` ou Playwright

---

## Playwright não encontrado

### Erro
```
Error: playwright-chromium not found
```

### Solução
```bash
cd /home/dan/Documentos/ctech/ctech_be
pnpm exec playwright install chromium
```

---

## Rate Limiting (Google Custom Search, etc.)

### Sintoma
```
429 Too Many Requests
```

### Solução
1. Configure múltiplos tiers no M8 (Configurações → Scraping Services)
2. Aumente o delay entre requisições
3. Use chaves de API diferentes para diferentes tiers

---

## Debug de Scraping

Para ver o HTML sendo extraído:
```typescript
// Em qualquer action de scraping
console.log(html.substring(0, 1000)); // Log primeiro 1KB
```

Ou verifique os logs em:
- M8 → Logs de Sistema (`/8-configuracoes/logs`)
- Arquivo de log do Pino (se configurado)
