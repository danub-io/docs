---
title: "Setup Local — Backend CTECH"
---



Guia passo a passo para configurar o ambiente de desenvolvimento do backend.

## Pré-requisitos

- **Node.js** >= 22.12.0
- **pnpm** (gerenciador de pacotes)
- **Turso CLI** (para banco de dados)

```bash
# Instalar pnpm (se não tiver)
npm install -g pnpm

# Instalar Turso CLI
curl -sSfL https://get.turso.tech | bash
```

## Passos

### 1. Clonar e instalar dependências

```bash
git clone <repo-url>
cd ctech_be
pnpm install
```

### 2. Configurar variáveis de ambiente

```bash
cp .env.example .env
```

Edite `.env` com suas credenciais:

```env
TURSO_DATABASE_URL=libsql://seu-banco-usuario.turso.io
TURSO_AUTH_TOKEN=seu-token-aqui
ADMIN_SECRET=sua-chave-secreta
ENCRYPTION_KEY=1234567890abcdef1234567890abcdef
```

### 3. Obter credenciais Turso

```bash
turso auth login
turso db list
turso db show <nome-do-banco>
turso db tokens create <nome-do-banco>
```

### 4. Aplicar migrações do banco

```bash
pnpm db:push
```

Para gerar novas migrações após alterar o schema:

```bash
pnpm db:generate
pnpm db:push
```

### 5. Iniciar servidor de desenvolvimento

```bash
pnpm dev
```

Acesse http://localhost:3001

## Comandos Úteis

| Comando | Descrição |
|---------|-----------|
| `pnpm dev` | Servidor dev (Next.js, porta 3001) |
| `pnpm build` | Build de produção |
| `pnpm lint` | Verificar lint |
| `pnpm test:run` | Testes unitários |
| `pnpm test:e2e` | Testes E2E (Playwright) |
| `pnpm db:push` | Aplicar migrações ao banco |
| `pnpm db:studio` | Abrir Drizzle Studio |
| `pnpm clean` | Limpar `.next` e cache |

## Fluxo de Desenvolvimento

1. Edite código no módulo relevante (M1-M9)
2. Teste localmente com `pnpm dev`
3. Execute testes: `pnpm test:run`
4. Commit seguindo Conventional Commits

## Troubleshooting

### "TURSO_DATABASE_URL is missing!"

Copie `.env.example` para `.env` e preencha.

### "Failed to decrypt API key"

A `ENCRYPTION_KEY` foi alterada após as chaves terem sido salvas. Use a chave original ou re-criptografe as chaves dos provedores IA via M8.

### "validateAction() failed"

Sessão expirada ou `ADMIN_SECRET` incorreta. Verifique o cookie de sessão e o valor de `ADMIN_SECRET` no `.env`.

### Migrações não aplicadas

```bash
pnpm db:push
```

Verifique o schema com:

```bash
turso db shell <nome-do-banco> ".schema"
```

### Build falha

```bash
pnpm clean
pnpm build
```
