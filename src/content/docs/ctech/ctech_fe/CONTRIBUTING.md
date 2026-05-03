---
title: "Contribuindo para o CTECH Frontend (TechReveal)"
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
cp .env.example .env
# Configure as variáveis no .env (TURSO_DATABASE_URL, TURSO_AUTH_TOKEN)
pnpm dev
```

> Para um guia detalhado de setup (Turso local/remoto, seed, troubleshooting), veja [docs/development/setup-local.md](./docs/development/setup-local.md).

## Estratégia de Branches

- `master`: Branch principal, sempre pronta para produção
- `feature/*`: Novas funcionalidades (ex: `feature/laptop-filter`)
- `hotfix/*`: Correções urgentes em produção (ex: `hotfix/db-timeout`)
- `bugfix/*`: Correções não urgentes (ex: `bugfix/navbar-mobile`)

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
git commit -m "feat(laptops): add category filter component"
```

## Padrões de Código

- **TypeScript**: Strict mode ativado, evite `any`
- **Linting**: ESLint configurado (executar `pnpm lint` antes do commit)
- **Formatação**: Prettier (executar `pnpm format`)
- **UTF-8 SEM BOM**: Obrigatório para todos os arquivos
- **Mobile First**: Todo design começa pelo mobile
- **Componentes Astro**: Prefira componentes Astro estáticos para conteúdo, use React Islands apenas para interatividade
- **Imports**: Use path aliases (`@core/*`, `@modules/*`) em vez de caminhos relativos profundos

### Arquitetura

- `src/core/`: Infraestrutura global (UI, layouts, lib, types)
- `src/modules/`: Domínios de negócio isolados (laptops, compare, reviews, community, home)
- `src/pages/`: Camada de roteamento Astro (fina, apenas conecta dados a componentes)
- Serviços em `services/` acessam o banco Turso diretamente
- Componentes em `components/` recebem dados via props

## Execução de Testes

### Testes Unitários (Vitest)
```bash
pnpm test              # Roda testes em watch mode
pnpm test:run          # Roda testes uma vez
pnpm test:coverage     # Roda testes com relatório de cobertura
```

Cobertura mínima (configurada no `vitest.config.ts`):
- Linhas: 80%
- Funções: 75%
- Branches: 70%

### Testes E2E (Playwright)
```bash
pnpm exec playwright install  # Instala navegadores (primeira vez)
pnpm test:e2e                 # Roda testes E2E
```

## Processo de Pull Request

1. Crie uma branch a partir da `master`
2. Faça suas alterações seguindo os padrões acima
3. Execute testes e lint localmente:
   ```bash
   pnpm lint && pnpm test:run
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
- [ ] Mobile First respeitado (design responsivo)
- [ ] Imagens otimizadas com `<Image />` do Astro

## Referências

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Visão geral da arquitetura
- [DATA_LAYER.md](./DATA_LAYER.md) - Fluxo de dados e serviços
- [CI Workflow](./.github/workflows/ci.yml) - Pipeline de integração contínua
