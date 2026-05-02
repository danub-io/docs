---
title: "Erros Comuns e Soluções Rápidas"
---



## Erro: "Cannot find module @/lib/..."

### Sintoma
```
Module not found: @/lib/db
```

### Solução
Verifique se o `tsconfig.json` tem o path alias configurado:
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

## Erro: "validateAction() failed"

### Sintoma
```
Error: Unauthorized - validateAction() failed
```

### Solução
1. Verifique se está autenticado no painel
2. O cookie de sessão pode ter expirado (faça login novamente)
3. Em desenvolvimento, `validateAction()` pode ser bypassado (ver implementação em `@/lib/auth-utils`)

---

## Erro: "revalidatePath() called outside of server action"

### Sintoma
```
Error: revalidatePath() can only be called in Server Actions
```

### Solução
Certifique-se de que a função está marcada com `"use server"` e está sendo chamada de um Client Component via form ou `action()`.

---

## Erro: "Failed to decrypt API key"

### Sintoma
```
Error: Decryption failed - invalid ciphertext
```

### Causa
A `ENCRYPTION_KEY` no `.env` foi alterada, quebrando as chaves salvas no banco.

### Solução
1. Restaure a `ENCRYPTION_KEY` original
2. Ou re-cadastre as chaves API no M8 (serão criptografadas com a nova chave)

---

## Build falha no Next.js

### Verificação rápida
```bash
cd /home/dan/Documentos/ctech/ctech_be
pnpm build
```

Erros comuns:
- **TypeScript errors:** `pnpm typecheck`
- **Missing dependencies:** `pnpm install`
- **Environment variables:** Verifique `.env`

---

## Worker não processa jobs

### Verificação
1. Acesse `/api/health` - o worker deve aparecer como `active: true`
2. Verifique se há jobs pendentes: `SELECT * FROM fila_processamento WHERE status = 'pendente';`
3. O worker roda via Server Actions (`processNextJob()`), precisa ser disparado manualmente ou via UI

---

## Limpar cache do Next.js

```bash
cd /home/dan/Documentos/ctech/ctech_be
rm -rf .next
pnpm dev
```
