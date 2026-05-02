---
title: "Variáveis de Ambiente"
---



O projeto requer as seguintes variáveis de ambiente:

## Obrigatórias

```env
# URL do banco Turso (SQLite distribuído)
# Obtida no dashboard do Turso (https://turso.tech)
TURSO_DATABASE_URL=libsql://seu-banco-username.turso.io

# Token de autenticação do Turso
# Gere com: turso auth token
TURSO_AUTH_TOKEN=seu-token-aqui
```

## Como Configurar

### Desenvolvimento Local

1. Copie `.env.example` para `.env`:
   ```bash
   cp .env.example .env
   ```
2. Preencha os valores com suas credenciais do Turso
3. O arquivo `.env` está no `.gitignore` (não commitar)

### Produção (Vercel)

Configure no dashboard da Vercel: Project Settings → Environment Variables.

## Obter Credenciais Turso

```bash
# Instalar Turso CLI
curl -sSfL https://get.turso.tech | bash

# Login
turso auth login

# Listar bancos
turso db list

# Obter URL e token
turso db show <nome-do-banco>
turso db tokens create <nome-do-banco>
```
