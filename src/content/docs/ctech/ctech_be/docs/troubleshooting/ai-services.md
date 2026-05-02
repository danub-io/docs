---
title: "Falhas em Modelos de IA"
---



## Erro: "AI model unavailable"

### Sintoma
```
Error: Model google/gemini-2.0-flash is not available
```

### Solução
1. Verifique se a chave API está correta no M8 (Configurações → AI Models)
2. Confirme se o provedor suporta o modelo selecionado
3. Verifique se há cotas/limites na conta do provedor

---

## Erro: "Invalid API Key"

### Sintoma
```
401 Unauthorized - Invalid API Key
```

### Solução
1. Re-criptografe a chave:
   - Vá em M8 → AI Models → Editar
   - Cole a chave novamente (será criptografada com `AES-256-CBC`)
2. Verifique se a `ENCRYPTION_KEY` no `.env` não foi alterada (quebraria chaves salvas)

---

## Cascata de Resiliência não funciona

### Sintoma
```
Todas as tentativas falham sem tentar próximo tier
```

### Verificação
1. Acesse M8 → AI Models
2. Confirme que há modelos cadastrados em **múltiplos tiers** (1 a 5)
3. Verifique se os modelos estão marcados como **Ativo**

---

## Erro de Parsing (JSON inválido da IA)

### Sintoma
```
Error: Failed to parse AI response as JSON
```

### Causa
A IA retornou texto fora do formato esperado (ex: markdown ```json ... ```).

### Solução
O projeto já possui fallback para limpar markdown (ver `atualizar-ia.ts`). Se persistir:
1. Ajuste o `system_prompt` no M8 para ser mais rígido
2. Use `generateObject` (Vercel AI SDK) em vez de `generateText` quando possível

---

## Timeouts em requisições IA

### Sintoma
```
Timeout: AI request took longer than Xms
```

### Solução
1. Aumente o timeout no provedor de IA (se disponível)
2. Use modelos menores/mais rápidos para tarefas simples
3. Verifique a conexão com a internet (latência alta)

---

## Verificar Stats de Uso

Acesse M8 → Logs de Sistema para ver:
- Top modelos por chamadas
- Tokens consumidos
- Custo estimado
