---
title: "Integração com Múltiplos Provedores de IA"
---



## Visão Geral

O CTECH Painel suporta múltiplos provedores de IA através do **Vercel AI SDK**, configurados dinamicamente no M8 (Configurações).

## Provedores Suportados

| Provedor | SDK Package | Exemplo de Modelo |
|----------|-------------|-------------------|
| Google | `@ai-sdk/google` | `gemini-2.0-flash` |
| Groq | `@ai-sdk/groq` | `llama3-70b-8192` |
| Cerebras | `@ai-sdk/cerebras` | `llama3.1-70b` |
| OpenRouter | `@ai-sdk/openrouter` | `meta-llama/...` |
| GitHub Models | `@ai-sdk/github-models` | `gpt-4o` |

## Configuração (M8)

As configurações são salvas na tabela `config_ai_models`:

```sql
CREATE TABLE config_ai_models (
    id INTEGER PRIMARY KEY,
    provider TEXT NOT NULL,
    model_id TEXT NOT NULL,
    api_key TEXT NOT NULL, -- Criptografado (AES-256-CBC)
    system_prompt TEXT,
    target_module TEXT NOT NULL,
    tier INTEGER NOT NULL,
    is_active INTEGER DEFAULT 1
);
```

## Cascata de Resiliência (Tiers)

Cada módulo pode ter até 5 tiers configurados:

```
Tier 1: Modelo primário (ex: gemini-2.0-flash)
  ↓ (falha)
Tier 2: Reserva 1 (ex: gpt-4o via GitHub)
  ↓ (falha)
Tier 3: Reserva 2 (ex: llama3-70b via Groq)
  ↓ (falha)
Tier 4: Reserva 3
  ↓ (falha)
Tier 5: Fallback final
```

## Factory Pattern (`lib/model-factory.ts`)

```typescript
import { getModelInstance } from "@/lib/model-factory";

// Retorna uma instância configurada do AI SDK
const model = getModelInstance(provider, model_id, api_key);
```

A factory instancia o provedor correto baseado na string `provider` salva no banco.

## Uso na Prática

```typescript
import { generateObject } from "ai";
import { z } from "zod";

// 1. Busca modelo configurado (M8)
const models = await getAIModels("extracao");
const modelConfig = models.find(m => m.provider === "google") || models[0];

// 2. Cria instância via factory
const model = getModelInstance(modelConfig.provider, modelConfig.model_id, modelConfig.api_key);

// 3. Usa com AI SDK
const { object } = await generateObject({
    model,
    schema: z.object({ nota: z.number(), pros: z.string() }),
    system: modelConfig.system_prompt || getDefaultPrompt("extracao"),
    prompt: "Analise este review..."
});
```

## Criptografia de API Keys

As chaves API são criptografadas em repouso usando `AES-256-CBC`:

```typescript
import { encrypt, decrypt } from "@/lib/encryption";

// Salvar (em upsertAIModel)
const encrypted = encrypt(api_key);

// Ler (em getAIModels)
const decrypted = decrypt(encrypted);
```

## Prompts Padrão

Se nenhum `system_prompt` for salvo no banco, a função `getDefaultPrompt(module)` retorna prompts pré-definidos para cada módulo (M1-M6).
