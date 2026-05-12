---
title: "Erros de Instalação"
---

## `pip install` falha

### Sintoma
```
error: externally-managed-environment
```

### Causa
Python 3.14+ no Arch Linux bloqueia instalação fora de venv.

### Solução
```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

---

## `ModuleNotFoundError: No module named 'prompt_toolkit'`

### Sintoma
```
ModuleNotFoundError: No module named 'prompt_toolkit'
```

### Solução
```bash
source .venv/bin/activate  # se usar venv
pip install -r requirements.txt
```

---

## `python: command not found`

### Solução
```bash
# Verificar se Python está instalado
which python3

# Usar python3 explicitamente
python3 main.py

# Ou criar alias (opcional)
alias python=python3
```

---

## OpenSSL / SSL errors

### Sintoma
```
SSL: CERTIFICATE_VERIFY_FAILED
```

### Solução
```bash
# Verificar data/hora do sistema
date

# Se macOS, reinstalar certificados
# /Applications/Python\ 3.x/Install\ Certificates.command
```
