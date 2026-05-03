---
title: "Setup Local — Frontend CTECH"
---



Guia passo a passo para configurar o ambiente de desenvolvimento do frontend.

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
cd ctech_fe
pnpm install
```

### 2. Configurar variáveis de ambiente

```bash
cp .env.example .env
```

Edite `.env` com suas credenciais Turso:

```env
TURSO_DATABASE_URL=libsql://seu-banco-usuario.turso.io
TURSO_AUTH_TOKEN=seu-token-aqui
```

### 3. Obter credenciais Turso

```bash
# Login no Turso
turso auth login

# Listar bancos disponíveis
turso db list

# Obter URL do banco
turso db show <nome-do-banco>

# Gerar token de autenticação
turso db tokens create <nome-do-banco>
```

### Opção A: Banco remoto (Turso)

Recomendado para desenvolvimento. Use o banco compartilhado da equipe ou crie seu próprio:

```bash
turso db create ctech-dev
turso db show ctech-dev        # URL
turso db tokens create ctech-dev  # Token
```

### Opção B: Banco local (SQLite)

Para desenvolvimento offline, use SQLite local:

1. Crie um arquivo `local.db` no projeto
2. Aponte `.env` para ele:
   ```env
   TURSO_DATABASE_URL=file:./local.db
   TURSO_AUTH_TOKEN=
   ```
3. Popule com seed data (se disponível):
   ```bash
   node scripts/seed_guias.mjs
   ```

### 4. Iniciar servidor de desenvolvimento

```bash
pnpm dev
```

Acesse http://localhost:4321

## Comandos Úteis

| Comando | Descrição |
|---------|-----------|
| `pnpm dev` | Servidor dev com hot-reload |
| `pnpm build` | Build de produção |
| `pnpm preview` | Preview do build |
| `pnpm lint` | Verificar lint |
| `pnpm format` | Formatar código |
| `pnpm test:run` | Testes unitários |
| `pnpm test:coverage` | Testes com cobertura |
| `pnpm test:e2e` | Testes E2E (Playwright) |

## Troubleshooting

### "TURSO_DATABASE_URL is missing!"

O `.env` não foi criado ou está incompleto. Copie de `.env.example`.

### "Sharp is not available"

```bash
pnpm add sharp
pnpm rebuild sharp
```

### Banco retorna vazio

Verifique se o backend (ctech_be) já populou o banco com produtos com `status = 'AprovadoM4'`.

```bash
turso db shell <nome-do-banco> "SELECT COUNT(*) FROM Produtos WHERE status = 'AprovadoM4'"
```
