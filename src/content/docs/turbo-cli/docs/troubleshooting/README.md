---
title: "Troubleshooting"
---

This folder contains solutions for common issues encountered during turbo-cli development and usage.

## Contents

- `build-errors.md` — Python/dependency installation errors

## Quick Diagnosis

```bash
# Check Python installation
python --version

# Check dependencies
pip list | grep -E "prompt-toolkit|openai|rich|pydantic"

# Check config
cat ~/.config/turbo-cli/config.json

# Test API key
curl -H "Authorization: Bearer $(python3 -c "import json; print(json.load(open(f'{__import__('pathlib').Path.home()}/.config/turbo-cli/config.json'))['api_key'])" )" \
  https://api.openai.com/v1/models 2>/dev/null | head -c 100
```

## Common Errors

### API Key not configured

The app will prompt for the API key on first run. If skipped, use `/key <key>` inside the app.

### Connection refused / timeout

Check `base_url` in `~/.config/turbo-cli/config.json` and network connectivity.

### Model not found

Check if the model is available for your API key: `/model <existing-model>`.
