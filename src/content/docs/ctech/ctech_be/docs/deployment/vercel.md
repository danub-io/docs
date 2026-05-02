---
title: "Deploy na Vercel - CTECH Painel"
---



## Pré-requisitos

- Conta na [Vercel](https://vercel.com)
- CLI da Vercel instalado: `npm i -g vercel`
- Banco Turso configurado e URL em mãos

## Passo a Passo

### 1. Conectar Repositório

```bash
cd /home/dan/Documentos/ctech/ctech_be
vercel login
vercel link
```

### 2. Configurar Variáveis de Ambiente

Via dashboard da Vercel ou CLI:

```bash
vercel env add TURSO_DATABASE_URL
vercel env add TURSO_AUTH_TOKEN
vercel env add ENCRYPTION_KEY
vercel env add NEXTAUTH_SECRET
```

### 3. Deploy

```bash
# Preview
vercel

# Produção
vercel --prod
```

## Configuração do next.config.ts

O projeto já está configurado para Vercel (serverless). Não é necessário ajustar o `next.config.ts` para deploy básico.

## Variáveis de Ambiente Necessárias

| Variável | Descrição | Onde obter |
|----------|-----------|------------|
| `TURSO_DATABASE_URL` | URL do banco Turso | `turso db show [nome] --url` |
| `TURSO_AUTH_TOKEN` | Token de acesso | `turso db tokens create [nome]` |
| `ENCRYPTION_KEY` | Chave AES-256-CBC (32 chars) | Gerar: `openssl rand -hex 16` |
| `NEXTAUTH_SECRET` | Secret para next-auth | Gerar: `openssl rand -hex 32` |
| `GOOGLE_API_KEY` | (Opcional) Chave Google AI | Google AI Studio |

## Verificação Pós-Deploy

1. Acesse `/api/health` para verificar conexão com banco
2. Teste login/cookie (se aplicável)
3. Verifique logs na aba "Deployments" da Vercel

## Troubleshooting

**Erro de conexão com Turso:**
- Verifique se o token não expirou: `turso db tokens list [nome]`
- Confirme se a URL está no formato correto (`libsql://...`)

**Build falha:**
- Verifique se todas as env vars estão definidas
- Teste o build local: `pnpm build`
