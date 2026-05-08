---
title: "Contribuindo — CTECH Frontend"
---

Obrigado por contribuir! Este guia define os padrões e fluxos de trabalho para manter a qualidade e consistência do código.

## Configuração do Ambiente

Pré-requisitos:
- Node.js >= 22.12.0
- pnpm (gerenciador de pacotes)
- Conta no Turso (banco de dados)

Passos:
```bash
git clone <repo-url>
cd ctech_fe
pnpm install
cp .env.example .dev.vars
# Configure as variáveis no .dev.vars (TURSO_DATABASE_URL, TURSO_AUTH_TOKEN, AUTH_SECRET)
pnpm dev
```

## Estratégia de Branches

- `production`: Branch principal, sempre pronta para produção
- `develop`: Integração de funcionalidades antes do merge em `production`
- `feat/<nome>`: Novas funcionalidades (ex: `feat/laptop-filter`)
- `fix/<nome>`: Correções (ex: `fix/navbar-mobile`)
- `refactor/<nome>`: Refatorações (ex: `refactor/db-service`)
- `chore/<nome>`: Manutenção (ex: `chore/update-deps`)

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

Exemplo:
```bash
git commit -m "feat(categoria): add label-based section grouping"
```

## Padrões de Código

- **TypeScript**: Strict mode ativado, evite `any`
- **Linting**: ESLint configurado (executar `pnpm lint` antes do commit)
- **Formatação**: Prettier (executar `pnpm format`)
- **UTF-8 SEM BOM**: Obrigatório para todos os arquivos
- **Mobile First**: Todo design começa pelo mobile
- **Componentes Astro**: Prefira componentes Astro estáticos para conteúdo, use React Islands apenas para interatividade
- **Imports**: Use path aliases (`@core/*`, `@modules/*`) em vez de caminhos relativos profundos
- **Imagens**: Use `<img>` nativo com `loading="lazy"` e `decoding="async"`

### Arquitetura

- `src/core/`: Infraestrutura global (UI, layouts, lib, types)
- `src/modules/`: Domínios de negócio isolados (inicio, produto, categoria, guia, auth)
- `src/pages/`: Camada de roteamento Astro (fina, apenas conecta dados a componentes)
- Serviços em `services/` acessam o banco Turso diretamente
- Componentes em `components/` recebem dados via props

## Execução de Testes

### Testes Unitários (Vitest)
```bash
pnpm test:run          # Execução única
pnpm test:coverage     # Com relatório de cobertura
```

Cobertura mínima:
- Linhas: 80%
- Funções: 75%
- Branches: 70%

### Testes E2E (Playwright)
```bash
pnpm test:e2e
pnpm test:e2e:dev      # Com servidor dev automático
```

## Processo de Pull Request

1. Crie uma branch a partir da `develop`
2. Faça suas alterações seguindo os padrões acima
3. Execute testes e lint localmente:
   ```bash
   pnpm lint && pnpm exec tsc --noEmit && pnpm test:run
   ```
4. Abra o PR para a branch `develop`
5. Preencha o template de PR com descrição das mudanças e tipo de alteração
6. Aguarde revisão de código (mínimo 1 aprovação)
7. O merge só será realizado após aprovação e passagem do CI

## Validação Obrigatória

Ao finalizar alterações, execute:
1. `pnpm lint` — verificar ESLint
2. `pnpm exec tsc --noEmit` — type check
3. `pnpm test:run --coverage` — testes unitários com cobertura

## Checklist de Code Review

- [ ] Segue padrão de commits Conventional Commits
- [ ] Testes unitários adicionados ou atualizados
- [ ] Sem erros de lint (`pnpm lint`)
- [ ] Tipos TypeScript corretos (sem `any` desnecessário)
- [ ] Funcionalidade testada manualmente (se não coberta por testes)
- [ ] Mobile First respeitado (design responsivo)

## Referências

- [README](./README.md) — Visão geral do projeto
- [ARCHITECTURE](./ARCHITECTURE.md) — Arquitetura e decisões técnicas
- [DATA_LAYER](./DATA_LAYER.md) — Fluxo de dados e serviços
