---
title: "Installation Errors"
---

## `pip install` fails

### Symptom
```
error: externally-managed-environment
```

### Cause
Python 3.14+ on Arch Linux blocks installation outside a venv.

### Solution
```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

---

## `ModuleNotFoundError: No module named 'prompt_toolkit'`

### Symptom
```
ModuleNotFoundError: No module named 'prompt_toolkit'
```

### Solution
```bash
source .venv/bin/activate  # if using venv
pip install -r requirements.txt
```

---

## `python: command not found`

### Solution
```bash
# Check if Python is installed
which python3

# Use python3 explicitly
python3 main.py

# Or create an alias (optional)
alias python=python3
```

---

## OpenSSL / SSL errors

### Symptom
```
SSL: CERTIFICATE_VERIFY_FAILED
```

### Solution
```bash
# Check system date/time
date

# On macOS, reinstall certificates
# /Applications/Python\ 3.x/Install\ Certificates.command
```
