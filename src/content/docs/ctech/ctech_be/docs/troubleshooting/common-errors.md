---
title: "Common Errors and Quick Solutions"
---

## Error: "Cannot find module @/lib/..."

### Symptom
```
Module not found: @/lib/db
```

### Solution
Check if `tsconfig.json` has the path alias configured:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

---

## Error: "validateAction() failed"

### Symptom
```
Error: Unauthorized - validateAction() failed
```

### Solution
1. Verify you are authenticated in the panel
2. The session cookie may have expired (log in again)
3. In development, `validateAction()` can be bypassed (see implementation in `@/lib/auth-utils`)

---

## Error: "revalidatePath() called outside of server action"

### Symptom
```
Error: revalidatePath() can only be called in Server Actions
```

### Solution
Make sure the function is marked with `"use server"` and is being called from a Client Component via form or `action()`.

---

## Error: "Failed to decrypt API key"

### Symptom
```
Error: Decryption failed - invalid ciphertext
```

### Cause
The `ENCRYPTION_KEY` in `.env` was changed, breaking keys saved in the database.

### Solution
1. Restore the original `ENCRYPTION_KEY`
2. Or re-enter the API keys in M8 (they will be encrypted with the new key)

---

## Next.js Build Fails

### Quick check
```bash
cd /home/dan/Documentos/ctech/ctech_be
pnpm build
```

Common errors:
- **TypeScript errors:** `pnpm typecheck`
- **Missing dependencies:** `pnpm install`
- **Environment variables:** Check `.env`

---

## Worker not processing jobs

### Verification
1. Visit `/api/health` — the worker should show `active: true`
2. Check for pending jobs: `SELECT * FROM fila_processamento WHERE status = 'pendente';`
3. The worker runs via Server Actions (`processNextJob()`), it must be triggered manually or via the UI

---

## Clear Next.js Cache

```bash
cd /home/dan/Documentos/ctech/ctech_be
rm -rf .next
pnpm dev
```
