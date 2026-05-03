---
title: "Contributing to CTECH Painel (Backend)"
---



Obrigado por contribuir com o projeto! Este guia define os padrões e fluxos de trabalho para manter a qualidade e consistência do código.

## Configuração do Ambiente de Desenvolvimento

Pré-requisitos:
- Node.js >= 22.12.0
- pnpm (gerenciador de pacotes)
- Conta no Turso (banco de dados)
- Chaves de API para serviços de IA (opcional, para desenvolvimento local)

Passos:
```bash
git clone <repo-url>
cd ctech_be
pnpm install
cp .env.example .env
# Configure as variáveis no .env (TURSO_DB, TURSO_TOKEN, etc.)
pnpm dev
```

> Para um guia detalhado (migrações, Drizzle Studio, troubleshooting), veja [docs/development/setup-local.md](./docs/development/setup-local.md).

## Estratégia de Branches

- `master`: Branch principal, sempre pronta para produção
- `feature/*`: Novas funcionalidades (ex: `feature/m8-new-setting`)
- `hotfix/*`: Correções urgentes em produção (ex: `hotfix/db-connection-leak`)
- `bugfix/*`: Correções não urgentes (ex: `bugfix/m3-scraper-timeout`)

## Padrão de Commits (Conventional Commits)

Utilizamos Conventional Commits para manter o histórico organizado:

| Tipo | Descrição |
|------|-----------|
| `feat` | Nova funcionalidade |
| `fix` | Correção de bug |
| `docs` | Alterações na documentação |
| `style` | Formatação de código (sem mudança lógica) |
| `refactor` | Refatoração (sem novas features ou correções) |
| `test` | Adição/atualização de testes |
| `chore` | Manutenção (deps, scripts, etc.) |

Exemplo:
```bash
git commit -m "feat(m5): add price alert threshold validation"
```

## Padrões de Código

- **TypeScript**: Strict mode ativado, evite `any`
- **Linting**: ESLint configurado (executar `pnpm lint` antes do commit)
- **Formatação**: 2 espaços de indentação, UTF-8 sem BOM (configurado no `.editorconfig`)
- **Arquitetura**:
  - Use Server Actions (`src/app/actions/`) para lógica de negócio
  - Use Repository Pattern (`src/lib/repositories/`) para acesso a dados
  - Componentes UI em `src/components/ui/` (padrão Shadcn)

## Execução de Testes

### Testes Unitários (Vitest)
```bash
pnpm test              # Roda testes em watch mode
pnpm test:run          # Roda testes uma vez
pnpm test:ui           # Interface visual do Vitest
```

Cobertura mínima (configurada no `vitest.config.ts`):
- Linhas: 60%
- Funções: 60%
- Branches: 50%

### Testes E2E (Playwright)
```bash
pnpm exec playwright install  # Instala navegadores
pnpm exec playwright test     # Roda testes E2E
```

## Processo de Pull Request

1. Crie uma branch a partir da `master`
2. Faça suas alterações seguindo os padrões acima
3. Execute testes e lint localmente:
   ```bash
   pnpm lint && pnpm test:run && pnpm exec playwright test
   ```
4. Abra o PR para a branch `master`
5. Preencha o template de PR com:
   - Descrição das mudanças
   - Tipo de alteração (feat/fix/docs/etc.)
   - Issue relacionada (se houver)
6. Aguarde revisão de código (mínimo 1 aprovação)
7. O merge só será realizado após aprovação e passagem do CI

## Checklist de Code Review

- [ ] Segue padrão de commits Conventional Commits
- [ ] Testes unitários/E2E adicionados ou atualizados
- [ ] Sem erros de lint (`pnpm lint`)
- [ ] Documentação atualizada (se aplicável)
- [ ] Tipos TypeScript corretos (sem `any` desnecessário)
- [ ] Funcionalidade testada manualmente (se não coberta por testes)

## Referências

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Visão geral da arquitetura

- [CI Workflow](./.github/workflows/ci.yml) - Pipeline de integração contínua
