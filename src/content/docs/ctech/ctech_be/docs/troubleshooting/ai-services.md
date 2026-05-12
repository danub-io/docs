---
title: "AI Model Failures"
---

## Error: "AI model unavailable"

### Symptom
```
Error: Model google/gemini-2.0-flash is not available
```

### Solution
1. Verify the API key is correct in M8 (Settings → AI Models)
2. Confirm the provider supports the selected model
3. Check for quota/rate limits on the provider account

---

## Error: "Invalid API Key"

### Symptom
```
401 Unauthorized - Invalid API Key
```

### Solution
1. Re-encrypt the key:
   - Go to M8 → AI Models → Edit
   - Paste the key again (it will be encrypted with `AES-256-CBC`)
2. Check that the `ENCRYPTION_KEY` in `.env` has not been changed (would break saved keys)

---

## Resilience Cascade not working

### Symptom
```
All attempts fail without trying the next tier
```

### Verification
1. Go to M8 → AI Models
2. Confirm there are models registered across **multiple tiers** (1 to 5)
3. Verify the models are marked as **Active**

---

## Parsing Error (invalid AI JSON)

### Symptom
```
Error: Failed to parse AI response as JSON
```

### Cause
The AI returned text outside the expected format (e.g. markdown ```json ... ```).

### Solution
The project already has a fallback to clean markdown (see `atualizar-ia.ts`). If it persists:
1. Adjust the `system_prompt` in M8 to be more strict
2. Use `generateObject` (Vercel AI SDK) instead of `generateText` when possible

---

## AI Request Timeouts

### Symptom
```
Timeout: AI request took longer than Xms
```

### Solution
1. Increase the timeout on the AI provider (if available)
2. Use smaller/faster models for simple tasks
3. Check internet connection (high latency)

---

## Check Usage Stats

Go to M8 → System Logs to see:
- Top models by calls
- Tokens consumed
- Estimated cost
