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

## Per-Model Settings

### Provider Defaults

| Parameter | deepseek | opencode | openai | anthropic | gemini |
|-----------|----------|----------|--------|-----------|--------|
| `parallelToolCalls` | `false` | `false` | `true` | `true` | `true` |
| `maxToolRounds` | 30 | 25 | 30 | 25 | 20 |
| `stripThinkTokens` | `true` | `true` | `false` | `false` | `false` |
| `maxOutputTokens` | 65,536 | 16,384 | 16,384 | 8,192 | 8,192 |
| `systemPromptStyle` | `full` | `full` | `full` | `full` | `full` |
| `toolRoundDelay` | 100ms | 150ms | 0ms | 0ms | 0ms |

### Context Windows

| Model | Context Window |
|-------|---------------|
| `deepseek-v4-flash` | 1,048,576 |
| `deepseek-chat` | 65,536 |
| `deepseek-reasoner` | 65,536 |
| `gpt-4o` | 128,000 |
| `gpt-4o-mini` | 128,000 |
| `gpt-4-turbo` | 128,000 |
| `claude-sonnet-4` / `claude-sonnet-4-20250514` | 200,000 |
| `claude-3-5-sonnet-latest` | 200,000 |
| `claude-3-opus-latest` | 200,000 |
| `claude-3-haiku-latest` | 200,000 |
| `gemini-2.0-flash` | 1,048,576 |
| `gemini-2.0-pro` | 1,048,576 |

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

## DeepSeek V4 Flash (main model)

- **Context:** 1,048,576 tokens (1M)
- **Max output:** 393,216 tokens (384K)
- **Price:** $0.14/M input · $0.28/M output · $0.0028/M (cache hit)
- **Tool calls:** ✅ | **JSON output:** ✅ | **Thinking mode:** ✅
- **Canonical model ID:** `deepseek-v4-flash`
