---
title: "Variáveis de Ambiente (ctech_fe)"
---

O frontend requer as seguintes variáveis de ambiente:

## Obrigatórias

```env
# URL do banco Turso (SQLite distribuído)
# Obtida no dashboard do Turso (https://turso.tech)
TURSO_DATABASE_URL=libsql://seu-banco-username.turso.io

# Token de autenticação do Turso
# Gere com: turso db tokens create <nome-do-banco>
TURSO_AUTH_TOKEN=seu-token-aqui

# Chave secreta para assinatura de JWT
# Gere com: openssl rand -hex 32
AUTH_SECRET=********************************
```

## Google OAuth (Opcional)

```env
# Client ID e Secret do Google OAuth
# Obtidos no Google Cloud Console (https://console.cloud.google.com)
GOOGLE_CLIENT_ID=seu-google-client-id
GOOGLE_CLIENT_SECRET=seu-google-client-secret
```

## Módulo Comunidade (Opcional)

```env
# Habilita/desabilita o módulo de comunidade (login, reviews de usuários, feed)
# true = habilitado, false ou omitido = desabilitado (padrão)
COMMUNITY_ENABLED=false
```

> **Nota:** Quando desabilitado, todas as rotas `/comunidade`, `/painel`, `/api/auth/*`, `/api/reviews/*` e `user-reviews` retornam 404 e o middleware não carrega `currentUser`.

## Como Configurar

### Desenvolvimento Local

1. Copie `.env.example` para `.env`:
   ```bash
   cp .env.example .env
   ```
2. Copie também para **`.dev.vars`** (obrigatório para o runtime Cloudflare Workers):
   ```bash
   cp .env.example .dev.vars
   ```
3. Preencha os valores com suas credenciais
4. Ambos os arquivos estão no `.gitignore` (não commitar)

> **`.dev.vars`** é exigido pelo runtime Cloudflare Workers (miniflare) usado pelo `@astrojs/cloudflare`. Sem ele, `import.meta.env.TURSO_DATABASE_URL` será `undefined` e a inicialização falhará.

### Produção (Cloudflare Workers)

Configure os secrets no Worker via `pnpm wrangler secret put <NOME>`. Veja [vercel.md](./vercel.md) para detalhes do deploy.

> **Importante:** No runtime Cloudflare Workers, `import.meta.env` não expõe secrets automaticamente. Os módulos usam o padrão `import.meta.env.X || process.env.X`.

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

## Diferença para o Backend (ctech_be)

O ctech_fe **não** utiliza:
- `ENCRYPTION_KEY` (só o backend precisa para criptografar chaves de IA)
- `NEXTAUTH_SECRET` / `NEXTAUTH_URL` (o frontend usa JWT próprio com `jose`)
- Chaves de API de provedores de IA (`GOOGLE_API_KEY`, `GROQ_API_KEY`, etc.)

As únicas variáveis compartilhadas entre os dois projetos são `TURSO_DATABASE_URL` e `TURSO_AUTH_TOKEN`.
