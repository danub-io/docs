---
title: "Settings API"
---

Turbo Code provides a runtime configuration API and frontend UI for changing the model, provider, and API key without restarting the server.

## API Endpoints

### `GET /api/config/defaults`

Return optimized tuning parameters for a given model. Tuning is determined by model name prefix (e.g., `deepseek-*` → DeepSeek tuning, `gpt-*` → OpenAI tuning). This is the single source of truth — the engine reads from the config module, not hardcoded values.

**Query Parameters:**

| Param | Required | Description |
|-------|----------|-------------|
| `model` | No (default: current config) | Model name to get defaults for |

**Response:**

```json
{
  "parallelToolCalls": false,
  "maxToolRounds": 50,
  "stripThinkTokens": true,
  "maxOutputTokens": 65536,
  "systemPromptStyle": "concise",
  "toolRoundDelay": 100,
  "thinkingMode": "enabled",
  "reasoningEffort": "high",
  "autoDream": true
}
```

**Tuning by model family:**

| Family | parallel | stripThink | delay | maxTokens | rounds |
|--------|----------|------------|-------|-----------|--------|
| `deepseek-*` | false | true | 100ms | 65K | 50 |
| `claude-*` | true | false | 0ms | 8K | 25 |
| `gemini-*` | true | false | 0ms | 8K | 20 |
| `gpt-*`, `o1-*`, `o3-*` | true | false | 0ms | 16K | 30 |
| others (unknown) | true | false | 300ms | 16K | 30 |

All model families default to `contextCompression: false` and `compressionModel: null`.

### `GET /api/config/provider-defaults`

Return default base URLs for all supported providers. Used by the frontend to auto-fill the Base URL field when changing providers.

**Response:**

```json
{
  "deepseek": { "baseUrl": "https://api.deepseek.com/v1" },
  "openai": { "baseUrl": "https://api.openai.com/v1" },
  "opencode": { "baseUrl": "https://opencode.ai/zen/go/v1" },
  "anthropic": { "baseUrl": "https://api.anthropic.com/v1" },
  "gemini": { "baseUrl": "https://generativelanguage.googleapis.com/v1" }
}
```

### `GET /api/models`

Fetch available models from a provider dynamically. No hardcoded model lists — queries the provider's API directly.

**Query Parameters:**

| Param | Required | Description |
|-------|----------|-------------|
| `provider` | No (default: current config) | Provider name (`deepseek`, `openai`, `opencode`, `anthropic`, `gemini`) |
| `baseUrl` | No (default: current config) | API base URL for the provider |
| `apiKey` | No (default: current config) | API key for the provider |

**Response:**

```json
{
  "models": ["deepseek-v4-flash", "deepseek-chat", "deepseek-reasoner"],
  "error": null
}
```

On failure:

```json
{
  "models": [],
  "error": "API error (401)"
}
```

**How it works by provider:**

- **OpenAI-compatible** (deepseek, openai, opencode): `GET {baseUrl}/models` with `Authorization: Bearer {apiKey}`
- **Anthropic**: uses Anthropic native API only when `baseUrl` contains `anthropic.com`; otherwise falls back to OpenAI-compatible
- **Gemini**: uses `x-goog-api-key` header instead of query param; falls back to OpenAI-compatible for custom base URLs
- **Timeout**: all requests use `AbortSignal.timeout(10000)` (10s)

### `POST /api/config`

Update configuration at runtime.

**Request Body:**

```json
{
  "apiKey": "sk-...",
  "model": "deepseek-v4-flash",
  "provider": "opencode",
  "baseUrl": "https://opencode.ai/zen/go/v1",
  "cheapModel": "deepseek-v4-flash",
  "parallelToolCalls": false,
  "maxToolRounds": 30,
  "stripThinkTokens": true,
  "maxOutputTokens": 65536,
  "systemPromptStyle": "concise",
  "toolRoundDelay": 100,
  "autoDream": true
}
```

**Validation:**

Before saving, the server validates credentials by making a test `chatCompletion` call with `maxTokens: 1`. If the test fails, the API returns a 400 error:

```json
{
  "success": false,
  "error": "Invalid API key or endpoint. Check your credentials and try again."
}
```

**Success Response:**

```json
{
  "success": true,
  "model": "deepseek-v4-flash",
  "provider": "opencode",
  "baseUrl": "...",
  "apiKey": "...",
  "cheapModel": "...",
  "parallelToolCalls": false,
  "maxToolRounds": 30,
  "stripThinkTokens": true,
  "maxOutputTokens": 65536,
  "systemPromptStyle": "concise",
  "toolRoundDelay": 100,
  "autoDream": true
}
```

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `autoDream` | `boolean` | `true` | Automatically consolidate memories after conversations in Normal/Code modes |
| `contextCompression` | `boolean` | `false` | Enable async LLM-based context compression (replaces mechanical pruning with semantic summarization) |
| `compressionModel` | `string \| null` | `null` | Model to use for compression (uses `cheapModel` or main model if null) |

## SettingsDialog (Frontend)

The frontend provides a `SettingsDialog` component at `web/src/features/settings/SettingsDialog.tsx`:

- Accessible via a gear icon in the chat header
- Allows runtime changes to model, API key, provider, and all advanced tuning parameters
- **Provider** dropdown auto-fills the **Base URL** field from `GET /api/config/provider-defaults` (no hardcoded URLs)
- **Model** and **Cheap Model** are `<select>` dropdowns populated dynamically from `GET /api/models` based on the selected provider and base URL
  - Changing the provider refetches the model list
  - Changing the base URL triggers a debounced refetch (500ms)
  - If the current model is not in the new list, the first available model is auto-selected
  - If the cheap model is not in the new list, it resets to "None"
- When the **model** selection changes, **Advanced Model Settings** are automatically filled with optimized defaults from `GET /api/config/defaults?model=X`
  - This does not trigger on initial dialog open, only on user-initiated changes
  - Model fetch requests are deduplicated (latest request wins)
- If the model fetch fails (invalid key, network error), the dropdowns show an error state
- The **Advanced Model Settings** section includes tuning parameters (parallel tool calls, max tool rounds, strip think tokens, max output tokens, system prompt style, tool round delay, thinking mode, reasoning effort, auto-dream)
- Saves settings to `~/.config/turbo/config.json`
- Creates a new LLM client with updated configuration on success

## Config Persistence

Configuration is saved to `~/.config/turbo/config.json` and loaded on startup. If the file does not exist, defaults are used based on environment variable detection and model name heuristics.
