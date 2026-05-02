---
title: "PROJETO CTECH — PAINEL DE AUTOMAÇÃO 2026"
---


## Documento de Negócio e Domínio (Business Guide)

Ecossistema de curadoria técnica de hardware e inteligência comercial. Pipeline automatizado que transforma texto bruto em fichas de produto publicáveis com reviews consolidadas, preços monitorados e links afiliados auditados.

---

## 1. OS 6 MÓDULOS DE AUTOMAÇÃO (A REGRA DE NEGÓCIO)

### M1: ENTRADA (`1-entrada/` → `entrada.ts`)
**Objetivo:** Ingestão estruturada e detecção de duplicidade semântica.
- A IA extrai do texto bruto um JSON: `marca`, `nome_produto`, `specs_cru`, `tier I-V`.
- **Detecção de Duplicidade:** O sistema busca candidatos similares no banco via SQL (Marca/Nome). Os candidatos são enviados para a IA (Tier 1) para um veredito semântico: se for o mesmo modelo exato, o item vai para `conflitos_entrada` para revisão manual.
- **Zero Embeddings:** O projeto não utiliza mais busca vetorial para simplificar a infraestrutura e evitar dependências de modelos específicos.

### M2: DESCOBERTA (`2-descoberta/` → `descoberta.ts`)
**Objetivo:** Localizar links de reviews técnicas e editoriais em massa.
- Template base: `{{nome_produto}} review -site:youtube.com`.
- IA tria os links descartando fóruns, vídeos e lojas. O batch pode ser individual ou global.

### M3: EXTRAÇÃO (`3-extracao/` → `extracao.ts`)
**Objetivo:** Ler os artigos das reviews, pontuar e extrair o sumo.
- A IA analisa o Markdown extraído: define `nota_review` (0-10), `pros`, `contras` e `mini_review`.
- **Extração de Specs:** A IA extrai especificações faltantes (`specs_extraidas`) comparando o review com as specs do produto, enriquecendo a ficha técnica automaticamente (commit `82e3ff5`).
- **REGRA DE NEGÓCIO CRÍTICA:** PROIBIDO mencionar valores financeiros, preços ou moedas nas reviews para não deixar o conteúdo datado.
- Se a IA notar que o review fala de outro produto, marca `is_mismatch = 1`.

### M4: CONSOLIDAÇÃO (`4-consolidacao/` → `consolidacao.ts`)
**Objetivo:** Atuar como Editor-Chefe, unificando as informações extraídas no M3.
- Agrega até 8 reviews. 
- Matemática: `Nota Bayesiana` (média global 7.5, mín. 3 reviews) penalizada pelo `Fator de Defasagem` (0.2/ano).
- A IA sintetiza um Veredito Final (PT-BR) e `pros_gerais` / `contras_gerais`.
- **Otimização de Performance:** Processamento em batch das chamadas `processarConsolidacao` elimina gargalo N+1 no client-side, reduzindo latência em múltiplos produtos (commit `57b4d31`).

### M5: PREÇOS (`5-precos/` → `precos.ts`)
**Objetivo:** Monitoramento contínuo de preços nas lojas e detecção de falsos positivos no Google Shopping.
- A IA compara o título da loja com o produto real. Se for capinha, cabo ou modelo errado → `precisa_revisao = 1`.
- **REGRA DE IMAGEM:** O M5 não extrai mais imagens para a tabela de afiliados. Se uma imagem for detectada durante o filtro de IA e o produto ainda não tiver imagem principal, a IA pode sugerir a atualização diretamente na tabela `Produtos`.
- Variações de preço > R$ 5,00 são guardadas no `historico_precos` (retenção de 90 dias).

### M6: CONFERÊNCIA (`6-conferencia/` → `conferencia.ts`)
**Objetivo:** Auditoria do link final gerado (Afiliado).
- O scraper deve navegar exatamente na URL salva para pegar preço PIX/Boleto e estoque.
- **Extração:** A extração foi simplificada para focar apenas em Preço e Estoque. Imagens não são mais capturadas neste módulo.
- Se o produto não tiver estoque (`estoque === false`), marca `status_erro = 1`.

### M7: CMS (`7-cms/` → `cms.ts`)
**Objetivo:** Gerenciador central do catálogo de produtos (CRUD).
- Interface para listagem, filtros (marca, categoria, lançamento), edição e exclusão de produtos da tabela `Produtos`.
- **Server Actions:** `getProdutosAction`, `getFiltrosAction`, `updateProdutoAction`, `deleteProdutoAction`.
- **Repository:** `cms-repository.ts` centraliza o acesso ao banco para operações de leitura e escrita no catálogo.

### M8: Configurações (`8-configuracoes/` → `actions/8-configuracoes/`)
**Objetivo:** Painel modular de configurações globais para suporte à edição via vibecoding.
- **Submódulos:** Interface & UI (`/8-configuracoes`), Logs de Sistema (`/8-configuracoes/logs`), e configurações específicas por módulo M1-M6.
- **Server Actions:** `ai-models.ts`, `scraping-services.ts`, `logs.ts`, `preferences.ts` em `actions/8-configuracoes/`.
- **Estratégia de Modularização:** Cada módulo (M1-M8) é isolado para facilitar manutenção e edição pontual por IAs, reduzindo o contexto necessário para vibecoding.

### M9: Documentação (`9-docs/` → `src/app/docs/`)
**Objetivo:** Visualizador de documentação Markdown integrado ao painel.
- **Funcionalidades:** Renderização de `.md` via `react-markdown` + `remark-gfm`, busca textual integrada, navegação por seções.
- **UI:** Sidebar com índice, área de leitura com suporte a tabelas e código.
- **Server Actions:** M9 é leitura-only (UI), não possui Server Actions de mutação.
- **Arquivos renderizados:** `README.md`, `API.md`, `ARCHITECTURE.md`, `CONTRIBUTING.md`, `CHANGELOG.md` e arquivos em `docs/`.

---

## 2. SISTEMA ASSÍNCRONO, FILAS E MONITORAMENTO
- **Gerenciamento de Fila:** Tabela `fila_processamento` gerencia os jobs em background. Status: `pendente`, `processando`, `concluido`, `erro`, `falha_critica`.
- **Resiliência (DLQ):** O worker (`actions/worker.ts`) faz claim atômico. Se um job falhar, ele incrementa `tentativas`. Ao atingir **3 falhas**, o job é marcado como `falha_critica` (Dead Letter Queue), evitando desperdício de recursos e loops infinitos.
- **Monitoramento Estruturado:** O projeto utiliza `pino` via `@/lib/logger`. Todos os módulos críticos (M1-M6) devem registrar erros e avisos de forma estruturada para facilitar o debug em ambiente serverless.
- **Performance de Banco:** Queries em tabelas grandes (Produtos, Afiliados, Fila) são otimizadas via índices SQL em colunas de alta cardinalidade (`categoria`, `tier`, `modulo`, `referencia_id`).

---

## 3. BANCO DE DADOS (TURSO SQLITE)
- `Produtos`: Catálogo central (specs, nota final, imagem). **Fonte única de verdade para imagens.**
- `Reviews`: Análises unitárias (M3) e avaliações de usuários vinculadas a um produto. Possui `review_type` (`'critic'` | `'user'`) para separar análises de imprensa de avaliações de usuários.
- `Afiliados`: Links finais de loja/oferta validados no M6. (Coluna `imagem_url` removida em Abr/2026).
- `historico_precos`: Registro de oscilação de preço (limpo após 90 dias).
- `config_ai_models` e `config_scraping_services`: Tabelas que controlam a Cascata de Resiliência (6-tiers). Nelas ficam salvas as API Keys criptografadas at-rest em AES-256-CBC.
- `logs_entrada`: Auditoria completa de consumo (tokens, custo, payload, timestamps).
- `config_preferences`: Armazenamento de preferências globais de interface.
- **Limpeza de Esquema (Abril 2026):** Colunas obsoletas (`embedding`, `is_primary`, `is_fallback`, `is_reserve`, `Afiliados.imagem_url`) foram removidas para manter o banco leve e focado em tiers.

---

## 4. ESTRUTURA DE DIRETÓRIOS PRINCIPAIS
*   `/src/app/X-[modulo]/` - Rotas de UI do painel de cada módulo (1-entrada, 2-descoberta, ..., 7-cms, 8-configuracoes, 9-docs).
*   `/src/app/8-configuracoes/` - Painel de configurações globais (M8).
    *   **Geral:** Interface & UI (`/8-configuracoes`), Logs de Sistema (`/8-configuracoes/logs`).
    *   **Módulos de Automação:** Configurações específicas por módulo (M1-M6) em `/8-configuracoes/entrada/`, `/8-configuracoes/descoberta/`, etc.
    *   **Server Actions:** `/src/app/actions/8-configuracoes/` contém `ai-models.ts`, `scraping-services.ts`, `logs.ts`, `preferences.ts`.
*   `/src/app/actions/` - Core das Server Actions (onde roda a regra de negócio).
*   `/src/components/` - UI global (ActivityBar, Sidebar, CommandPalette, Logs).
*   `/src/lib/` - Helpers de BD, scraping, queues e criptografia.
*   `/src/lib/repositories/` - Padrão Repository para acesso ao banco de dados, isolando consultas SQL das Server Actions (ex: `cms-repository.ts`).

---

## 5. ESTRATÉGIA DE PERFORMANCE E UX (MANDATO 2026)
O sistema foi otimizado para navegação instantânea e percepção de "zero latência".

### SSR e Paralelismo (Velocidade Real)
- **Prioridade SSR:** Módulos de consulta pesada (M1, M2, M5, M6) utilizam Server-Side Rendering. Os dados são buscados no servidor e injetados diretamente nas props do Client Component.
- **I/O Paralelo:** O uso de `await Promise.all([consulta1, consulta2])` é obrigatório em páginas que dependem de múltiplas fontes de dados. Isso reduz o tempo de carregamento pela metade ao evitar o efeito "cascata" (waterfall).
- **Sem Flash de Carregamento:** O uso de `Suspense` com esqueletos de UI (`ModuleSkeleton`) garante que a estrutura da página apareça imediatamente enquanto o servidor processa o streaming de dados.

### Transições Fluidas (Velocidade Percebida)
- **Animações de Página:** O `GlobalResizableLayout` utiliza uma animação de `fade-in + slide-up` (0.3s) disparada pela troca de `pathname`. Isso cria uma sensação de continuidade e mascara eventuais atrasos de rede.
- **Prefetching:** Todos os links do `ActivityBar` possuem `prefetch={true}`, antecipando o download do código da próxima página.

### Layouts Resilientes (Persistência)
O sistema utiliza `react-resizable-panels` v4 para interfaces multi-coluna. Para garantir estabilidade:
- **IDs Obrigatórios:** Cada `ResizablePanel` deve ter um `id` único e estável. Sem isso, a persistência de layout falha e causa "jumping" ou perda de posição.
- **autoSaveId:** O `ResizablePanelGroup` deve possuir um `autoSaveId` único por visualização. 
- **Migration v4:** Em caso de instabilidade, renomeie o `autoSaveId` (ex: `m1-layout-v2`) para invalidar o cache antigo no banco de dados (`user_settings`) e forçar uma nova estrutura de dados (JSON vs Array).

---

## 6. AMBIENTE DE DESENVOLVIMENTO (GITHUB & TURSO)
Para garantir a continuidade operacional sem dependências globais do sistema:

- **GitHub CLI Local:** O executável está na raiz como `./gh-cli`. Utilize-o para gerenciar PRs, Issues e autenticação via protocolo SSH.
- **Repositórios:** O ecossistema é dividido em `ctech_be` (Next.js) e `ctech_fe` (Astro). Ambos utilizam a branch `master` como principal.
- **Git (SSH):** A conexão com o GitHub é feita via **SSH** usando chaves ED25519. URLs remotas devem seguir o padrão `git@github.com:danub-io/repo.git`.
- **Banco de Dados (Turso CLI):** O ambiente possui o **Turso CLI** (`turso`) instalado e autenticado. Utilize-o para realizar consultas SQL diretas e manutenção do esquema sem necessidade de scripts de aplicação.
- **Identidade Git:** O repositório está configurado localmente (`git config user.name/email`) para garantir que os commits sejam aceitos pelo GitHub mesmo em ambientes restritos.
