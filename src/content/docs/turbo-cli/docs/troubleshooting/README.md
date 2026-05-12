---
title: "Troubleshooting"
---

Esta pasta contém soluções para problemas comuns encontrados durante o desenvolvimento e uso do turbo-cli.

## Conteúdo

- `build-errors.md` — Erros de instalação Python/dependências

## Diagnóstico Rápido

```bash
# Verificar instalação Python
python --version

# Verificar dependências
pip list | grep -E "prompt-toolkit|openai|rich|pydantic"

# Verificar config
cat ~/.config/turbo-cli/config.json

# Testar API key
curl -H "Authorization: Bearer $(python3 -c "import json; print(json.load(open(f'{__import__('pathlib').Path.home()}/.config/turbo-cli/config.json'))['api_key'])" )" \
  https://api.openai.com/v1/models 2>/dev/null | head -c 100
```

## Erros Comuns

### API Key não configurada

O app pedirá a API key na primeira execução. Se pular, use `/key <chave>` dentro do app.

### Conexão recusada / timeout

Verificar `base_url` em `~/.config/turbo-cli/config.json` e conectividade de rede.

### Modelo não encontrado

Verificar se o modelo está disponível para sua API key: `/model <modelo-existente>`.
