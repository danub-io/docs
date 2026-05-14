---
title: "Settings API"
---

Turbo Code provides a runtime configuration API and frontend UI for changing the model, provider, and API key without restarting the server.

## API Endpoint

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
  "systemPromptStyle": "full",
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
  "systemPromptStyle": "full",
  "toolRoundDelay": 100,
  "autoDream": true
}
```

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `autoDream` | `boolean` | `true` | Automatically consolidate memories after conversations in Normal/Code modes |

## SettingsDialog (Frontend)

The frontend provides a `SettingsDialog` component at `web/src/features/settings/SettingsDialog.tsx`:

- Accessible via a gear icon in the chat header
- Allows runtime changes to model, API key, provider, and auto-dream toggle
- The **Advanced Settings** section includes an **Auto-Dream** checkbox with tooltip explaining it consolidates memories in background using the cheap model
- Saves settings to `~/.config/turbo/config.json`
- Creates a new LLM client with updated configuration on success

## Config Persistence

Configuration is saved to `~/.config/turbo/config.json` and loaded on startup. If the file does not exist, defaults are used based on environment variable detection.
