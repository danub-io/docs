---
title: "Integration with Multiple AI Providers"
---

## Overview

The CTECH Panel supports multiple AI providers through the **Vercel AI SDK**, dynamically configured in M8 (Settings).

## Supported Providers

| Provider | SDK Package | Example Model |
|----------|-------------|---------------|
| Google | `@ai-sdk/google` | `gemini-2.0-flash` |
| Groq | `@ai-sdk/groq` | `llama3-70b-8192` |
| Cerebras | `@ai-sdk/cerebras` | `llama3.1-70b` |
| OpenRouter | `@ai-sdk/openrouter` | `meta-llama/...` |
| GitHub Models | `@ai-sdk/github-models` | `gpt-4o` |

## Configuration (M8)

Settings are saved in the `config_ai_models` table:

```sql
CREATE TABLE config_ai_models (
    id INTEGER PRIMARY KEY,
    provider TEXT NOT NULL,
    model_id TEXT NOT NULL,
    api_key TEXT NOT NULL, -- Encrypted (AES-256-CBC)
    system_prompt TEXT,
    target_module TEXT NOT NULL,
    tier INTEGER NOT NULL,
    is_active INTEGER DEFAULT 1
);
```

## Resilience Cascade (Tiers)

Each module can have up to 5 configured tiers:

```
Tier 1: Primary model (e.g. gemini-2.0-flash)
  ↓ (fail)
Tier 2: Backup 1 (e.g. gpt-4o via GitHub)
  ↓ (fail)
Tier 3: Backup 2 (e.g. llama3-70b via Groq)
  ↓ (fail)
Tier 4: Backup 3
  ↓ (fail)
Tier 5: Final fallback
```

## Factory Pattern (`lib/model-factory.ts`)

```typescript
import { getModelInstance } from "@/lib/model-factory";

// Returns a configured AI SDK instance
const model = getModelInstance(provider, model_id, api_key);
```

The factory instantiates the correct provider based on the `provider` string saved in the database.

## Usage in Practice

```typescript
import { generateObject } from "ai";
import { z } from "zod";

// 1. Fetch configured model (M8)
const models = await getAIModels("extracao");
const modelConfig = models.find(m => m.provider === "google") || models[0];

// 2. Create instance via factory
const model = getModelInstance(modelConfig.provider, modelConfig.model_id, modelConfig.api_key);

// 3. Use with AI SDK
const { object } = await generateObject({
    model,
    schema: z.object({ nota: z.number(), pros: z.string() }),
    system: modelConfig.system_prompt || getDefaultPrompt("extracao"),
    prompt: "Analyze this review..."
});
```

## API Key Encryption

API keys are encrypted at rest using `AES-256-CBC`:

```typescript
import { encrypt, decrypt } from "@/lib/encryption";

// Save (in upsertAIModel)
const encrypted = encrypt(api_key);

// Read (in getAIModels)
const decrypted = decrypt(encrypted);
```

## Default Prompts

If no `system_prompt` is saved in the database, the `getDefaultPrompt(module)` function returns pre-defined prompts for each module (M1-M6).
