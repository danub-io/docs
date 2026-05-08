---
title: "Contribuindo — CTECH Backend"
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
cp .env.example .env.local
# Configure as variáveis no .env.local
pnpm dev
```

## Estratégia de Branches

- `production`: Branch principal, sempre pronta para produção
- `develop`: Integração de funcionalidades
- `feature/*`: Novas funcionalidades
- `fix/*`: Correções
- `refactor/*`: Refatorações
- `chore/*`: Manutenção

## Padrão de Commits (Conventional Commits)

| Tipo | Descrição |
|------|-----------|
| `feat` | Nova funcionalidade |
| `fix` | Correção de bug |
| `docs` | Alterações na documentação |
| `style` | Formatação de código (sem mudança lógica) |
| `refactor` | Refatoração (sem novas features ou correções) |
| `test` | Adição/atualização de testes |
| `chore` | Manutenção (deps, scripts, etc.) |

## Padrões de Código

- **TypeScript**: Strict mode ativado, evite `any`
- **Linting**: ESLint configurado (executar `pnpm lint` antes do commit)
- **Formatação**: 2 espaços de indentação, UTF-8 sem BOM
- **Arquitetura**:
  - Server Actions em `src/app/actions/` para lógica de negócio
  - Repository Pattern em `src/lib/repositories/` para acesso a dados
  - Componentes UI em `src/components/ui/` (padrão Shadcn)
- **Logger**: Use `@/lib/logger` em vez de `console.log`

## Execução de Testes

### Testes Unitários (Vitest)
```bash
pnpm test:run          # Execução única
pnpm test:ui           # Interface visual
```

Cobertura mínima: lines 60%, functions 60%, branches 50%

### Testes E2E (Playwright)
```bash
pnpm exec playwright test
```

## Processo de Pull Request

1. Crie uma branch a partir da `develop`
2. Faça suas alterações seguindo os padrões acima
3. Execute testes e lint localmente:
   ```bash
   pnpm lint && pnpm test:run
   ```
4. Abra o PR para a branch `develop`
5. Aguarde revisão de código (mínimo 1 aprovação)
6. O merge só será realizado após aprovação e passagem do CI

## Checklist de Code Review

- [ ] Segue padrão de commits Conventional Commits
- [ ] Testes adicionados ou atualizados
- [ ] Sem erros de lint (`pnpm lint`)
- [ ] Tipos TypeScript corretos (sem `any` desnecessário)
- [ ] Funcionalidade testada manualmente (se não coberta por testes)

## Referências

- [README](./README.md) — Visão geral do projeto
- [ARCHITECTURE](./ARCHITECTURE.md) — Arquitetura e decisões técnicas
- [API](./API.md) — Referência de API
