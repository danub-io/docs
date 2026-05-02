---
title: "CTECH Frontend (TechReveal)"
---



Interface pública de alta performance para o ecossistema CTECH. Construída com **Astro 6** e **React 19**, focada em SEO, velocidade e experiência do usuário.

## 🚀 Tecnologias

- **Framework:** Astro 6+ (SSR/SSG) com Islands Architecture
- **Biblioteca de UI:** React 19 (componentes interativos)
- **Estilização:** Tailwind CSS v4 + Design Tokens customizados
- **Componentes:** Shadcn/ui + Base UI (Radix)
- **Banco de Dados:** Turso (libsql) — SQLite distribuído
- **Validação:** Zod v4
- **Testes:** Vitest (unitários) + Playwright (E2E)
- **CI/CD:** GitHub Actions

## 🛠️ Instalação e Execução

### Pré-requisitos

- `pnpm` instalado
- Node.js >= 22.12.0
- Conta no [Turso](https://turso.tech) (banco de dados)

### Variáveis de Ambiente

Copie `.env.example` para `.env` e configure:

```env
TURSO_DATABASE_URL=libsql://seu-banco.turso.io
TURSO_AUTH_TOKEN=seu-token-aqui
```

### Comandos

```bash
# Instalar dependências
pnpm install

# Desenvolvimento
pnpm dev                    # Inicia servidor local (http://localhost:4321)

# Build
pnpm build                  # Build de produção
pnpm preview                # Preview do build

# Testes
pnpm test                   # Testes unitários (watch mode)
pnpm test:run               # Testes unitários (execução única)
pnpm test:coverage          # Testes com relatório de cobertura
pnpm test:e2e               # Testes end-to-end (Playwright)

# Lint e Formatação
pnpm lint                   # Verifica lint
pnpm format                 # Formata código com Prettier
```

## 📄 Páginas

| Rota | Descrição |
|------|-----------|
| `/` | Home com produto em destaque e tendências |
| `/laptops` | Lista de laptops aprovados com filtros |
| `/compare` | Comparação lado a lado de produtos |
| `/community` | Feed com reviews recentes da comunidade |
| `/reviews/[slug]` | Página detalhada de review de produto |

## 🏗️ Arquitetura

O projeto segue metodologia **Modular (Vibecoding)**, otimizada para desenvolvimento assistido por IA:

```
src/
├── core/         # Infraestrutura global (UI, layouts, lib, types)
├── modules/      # Domínios isolados (laptops, compare, reviews...)
└── pages/        # Rotas Astro (camada fina de conexão)
```

> Consulte [ARCHITECTURE.md](./ARCHITECTURE.md) e [DATA_LAYER.md](./DATA_LAYER.md) para detalhes completos.

## 🛡️ Segurança

- Content Security Policy (CSP) configurada via middleware
- HSTS, X-Frame-Options, X-Content-Type-Options
- Consultas parametrizadas ao banco (sem SQL injection)
- Cliente Turso usado apenas em SSR (nunca exposto ao cliente)

## 📦 Deploy

O build gera uma saída standalone em `dist/` pronta para deploy em:

- **Vercel** (recomendado): Conecte o repositório e configure as env vars
- **Docker**: Use a imagem Node.js 22+ com `pnpm build && pnpm start`
- **Servidor próprio**: Execute `pnpm build` e sirva `dist/` com Node.js

> O adaptador Node.js (`@astrojs/node`) está configurado no modo `standalone`.

## 🤝 Contribuindo

Veja [CONTRIBUTING.md](./CONTRIBUTING.md) para guia completo de contribuição.

## 📚 Documentação

- [ARCHITECTURE.md](./ARCHITECTURE.md) — Arquitetura e decisões técnicas
- [DATA_LAYER.md](./DATA_LAYER.md) — Fluxo de dados e serviços
- [CONTRIBUTING.md](./CONTRIBUTING.md) — Guia de contribuição
- [CHANGELOG.md](./CHANGELOG.md) — Histórico de versões
- [docs/](./docs/) — Subdocumentos por tópico

---

_Licença MIT — CTECH Frontend v2026.4_
