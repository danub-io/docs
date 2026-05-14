---
title: "Providers & Models"
---

## Supported Providers

| Provider | Detection | Base URL (default) |
|----------|-----------|-------------------|
| `opencode` | `OPENGODE_API_KEY` or `OPENCODE_API_KEY` or `TURBO_BASE_URL` contains "opencode" | `https://opencode.ai/zen/go/v1` (overridable via `OPENCODE_BASE_URL`) |
| `deepseek` | `DEEPSEEK_API_KEY` or model contains "deepseek" | `https://api.deepseek.com/v1` |
| `openai` | `OPENAI_API_KEY` (fallback) | `https://api.openai.com/v1` (overridable via `OPENAI_BASE_URL`) |
| `anthropic` | `ANTHROPIC_API_KEY` | Anthropic SDK |
| `gemini` | `GEMINI_API_KEY` or `GOOGLE_API_KEY` | Google SDK |

> The base URL can be overridden via `TURBO_BASE_URL` in `.env`.

## Model Discovery

Model lists are **never hardcoded**. The settings UI fetches available models dynamically from each provider's API:

- **OpenAI-compatible** (deepseek, openai, opencode, etc.): `GET {baseUrl}/models` with `Authorization: Bearer {apiKey}`
- **Anthropic**: uses Anthropic native API only when `baseUrl` contains `anthropic.com`; otherwise falls back to OpenAI-compatible
- **Gemini**: uses `x-goog-api-key` header instead of query param; falls back to OpenAI-compatible for custom base URLs

This is handled by the `GET /api/models` backend endpoint, which returns the raw model list from the provider. If the request fails (e.g., invalid API key, network error), the UI shows an error state — no fallback lists are used.

## Model Tuning

Tuning parameters are determined by the **model name**, not by the provider. This is critical because platforms like OpenCode host dozens of models from different providers — each model gets its own optimal tuning regardless of which provider serves it.

The `modelDefaults()` function in `src/config/index.ts` detects the model family by name prefix:

| Model prefix | parallelToolCalls | stripThinkTokens | toolRoundDelay | maxOutputTokens | maxToolRounds |
|-------------|:-:|:-:|:-:|:-:|:-:|
| `deepseek-*` | `false` | `true` | 100ms | 65,536 | 15 |
| `claude-*` | `true` | `false` | 0ms | 8,192 | 25 |
| `gemini-*` | `true` | `false` | 0ms | 8,192 | 20 |
| `gpt-*`, `o1-*`, `o3-*` | `true` | `false` | 0ms | 16,384 | 30 |
| Unknown models | `true` | `false` | 300ms | 16,384 | 30 |

All model families default to `systemPromptStyle: "full"`, `thinkingMode: "enabled"`, `reasoningEffort: "high"`, and `autoDream: true`.

When the user selects a model in the Settings UI, the frontend calls `GET /api/config/defaults?model=X` and auto-fills all advanced settings with these optimized values.

## Model Patterns

The pattern detection table lives in `src/config/index.ts` as `MODEL_PATTERNS` and is imported by the LLM client — the engine never duplicates this data:

```typescript
export const MODEL_PATTERNS: Record<string, { prefix: string[]; label: string }> = {
  deepseek: { prefix: ["deepseek"], label: "DeepSeek" },
  openai:   { prefix: ["gpt-", "o1-", "o3-"], label: "OpenAI" },
  openrouter: { prefix: [], label: "OpenRouter" },
  opencode: { prefix: [], label: "OpenCode" },
};
```

## Environment Variables

| Variable | Purpose | Example |
|----------|---------|---------|
| `TURBO_API_KEY` | Universal key (fallback) | `sk-...` |
| `OPENGODE_API_KEY` | OpenCode Zen key | `sk-...` |
| `OPENCODE_API_KEY` | OpenCode Zen key (alternative) | `sk-...` |
| `OPENAI_API_KEY` | OpenAI key | `sk-...` |
| `ANTHROPIC_API_KEY` | Anthropic key | `sk-...` |
| `DEEPSEEK_API_KEY` | DeepSeek key | `sk-...` |
| `GEMINI_API_KEY` | Gemini key | `...` |
| `GOOGLE_API_KEY` | Gemini key (alternative) | `...` |
| `TURBO_MODEL` | Active model | `deepseek-v4-flash` |
| `TURBO_BASE_URL` | API base URL (overrides all) | `https://opencode.ai/zen/go/v1` |
| `OPENCODE_BASE_URL` | OpenCode base URL | `https://opencode.ai/zen/go/v1` |
| `OPENAI_BASE_URL` | OpenAI-compatible base URL | `https://api.openai.com/v1` |
| `TURBO_CHEAP_MODEL` | Cheap model for /dream and auto-dream background consolidation | `deepseek-v4-flash` |
| `PORT` | HTTP server port (default: 3001) | `3001` |
