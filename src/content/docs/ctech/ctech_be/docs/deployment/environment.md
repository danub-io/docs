---
title: "Configuração de Variáveis de Ambiente"
---



## Arquivo `.env.example`

O projeto deve conter um arquivo `.env.example` na raiz com todas as variáveis necessárias:

```bash
# Banco de Dados (Turso)
TURSO_DATABASE_URL=libsql://seu-banco.turso.io
TURSO_AUTH_TOKEN=eyJhbGciOiJF...

# Criptografia (AES-256-CBC)
ENCRYPTION_KEY=1234567890abcdef1234567890abcdef

# NextAuth
NEXTAUTH_SECRET=seu-secret-aqui-32-chars-minimum
NEXTAUTH_URL=http://localhost:3000

# Opcionais (Provedores de IA)
GOOGLE_API_KEY=AIza...
GROQ_API_KEY=gsk_...
CEREBRAS_API_KEY=...
OPENROUTER_API_KEY=sk-or-...
GITHUB_TOKEN=ghp_...

# Logs
PINO_LOG_LEVEL=info  # trace|debug|info|warn|error|fatal
```

## Como Configurar

### Desenvolvimento Local

1. Copie o exemplo:
```bash
cp .env.example .env
```

2. Preencha com seus valores reais
3. O arquivo `.env` está no `.gitignore` (não commitar!)

### Produção (Vercel)

Adicione via dashboard ou CLI:
```bash
vercel env add TURSO_DATABASE_URL
vercel env add TURSO_AUTH_TOKEN
# ... repetir para cada variável
```

### Verificação

Ao iniciar o projeto, verifique se todas as variáveis estão carregadas:
```bash
pnpm dev
# Verifique os logs de inicialização
```

## Variáveis Obrigatórias vs Opcionais

### Obrigatórias
- `TURSO_DATABASE_URL`
- `TURSO_AUTH_TOKEN`
- `ENCRYPTION_KEY` (32 caracteres hex = 16 bytes)
- `NEXTAUTH_SECRET`

### Opcionais
- Chaves de API para provedores de IA (configuradas via M8)
- `PINO_LOG_LEVEL` (padrão: `info`)

## Gerar Chaves Seguras

```bash
# ENCRYPTION_KEY (16 bytes = 32 hex chars)
openssl rand -hex 16

# NEXTAUTH_SECRET (32 bytes = 64 hex chars)
openssl rand -hex 32
```
