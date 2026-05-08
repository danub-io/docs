---
title: "Postmortem 003: CSP bloqueando hidratação de componentes React"
---

## Sumário

- **Data:** 2026-05-07
- **Componente:** `src/middleware.ts` (CSP headers)
- **Sintoma:** Todos os componentes React com `client:load` falhavam silenciosamente — HTML SSR renderizava mas nada era interativo
- **Severidade:** Crítica — Afetava **todos** os islands React do frontend
- **Root cause:** `script-src 'self'` no middleware bloqueava os scripts inline que o Astro usa para hidratação de ilhas

## Timeline

1. O menu hamburguer (NavDrawer) parou de responder a cliques
2. Debugging inicial focou no componente: estado controlado, eventos, floating-ui
3. Código do NavDrawer foi extensivamente analisado e modificado (estado controlado, `nativeButton={false}`, etc.)
4. Testes unitários passavam — 5/5 no nav-drawer, 399/399 no total
5. Testes E2E escritos confirmaram: o drawer não abria
6. Investigou-se o código interno do `@base-ui/react/drawer` (DrawerRoot, DialogTrigger, FloatingRootStore, etc.) em busca de falha no encadeamento de eventos
7. Teste E2E com captura de console revelou: **erros de CSP bloqueando scripts inline**
8. Causa raiz identificada: `script-src 'self'` no middleware

## Sintomas

- Componentes React com `client:load` renderizam o HTML inicial (SSR) perfeitamente
- Nenhum evento JavaScript é acionado — cliques não produzem resposta alguma
- Nenhum erro no terminal do servidor (`pnpm dev`)
- Nenhum erro no build (`pnpm build`)
- Todos os 399 testes unitários passam
- Erro silencioso no console do navegador:
  ```
  Executing inline script violates the following Content Security Policy
  directive 'script-src 'self''. Either the 'unsafe-inline' keyword, a
  hash, or a nonce is required to enable inline execution. The action
  has been blocked.
  ```

## Root Cause

A CSP em `src/middleware.ts` definia `script-src 'self'`, que bloqueia **todos os scripts inline**. O Astro depende de scripts inline para o sistema de hidratação de ilhas (`<astro-island>`):

```html
<script>
  (self.Astro || (self.Astro = {})).load = async (fn) => { await (await fn())() };
  window.dispatchEvent(new Event('astro:load'));
</script>
```

**Cadeia de falha:**

1. Navegador carrega página com HTML SSR
2. CSP bloqueia o script inline que define `Astro.load`
3. CSP bloqueia o script inline que dispara `astro:load`
4. `<astro-island client="load">` chama `start()`:
   - Verifica `Astro['load']` → `undefined`
   - Registra listener para evento `astro:load` → nunca chega
   - Ilha fica em **espera permanente**
5. Componente React nunca hidrata
6. Nenhum event handler é anexado ao DOM
7. Cliques no botão não produzem efeito

**Isso afeta TODOS os islands com `client:load`, `client:idle` ou `client:visible`.**

## Por Que Foi Tão Difícil de Encontrar

| Razão | Explicação |
|-------|-----------|
| **Build silencioso** | `astro build` não valida CSP — compila sem warnings |
| **Dev server silencioso** | `astro dev` não exibe erros de CSP no terminal |
| **Testes sem middleware** | Vitest + jsdom não passam pelo middleware Astro — CSP nunca é aplicada |
| **SSR intacto** | HTML gerado perfeitamente — página parece completa visualmente |
| **Debug focado no componente errado** | O NavDrawer realmente tinha problemas (faltava estado controlado, `nativeButton`), então parecia que o debugging estava no caminho certo — mas o problema real era outro |
| **CSP é silenciosa por design** | Erros de CSP aparecem **apenas** no console do navegador, sem exceção JavaScript |
| **Testes enganam** | `userEvent.click()` passa nos testes porque jsdom não aplica CSP |

## Solução Aplicada

**Arquivo:** `src/middleware.ts` (linha 180)

```diff
- "script-src 'self'",
+ "script-src 'self' 'unsafe-inline'",
```

## Verificação

```bash
# 1. Verificar header CSP
curl -I http://localhost:4321 | grep content-security-policy
# Deve conter: script-src 'self' 'unsafe-inline'

# 2. Verificar console do navegador
# Nenhum erro de CSP relacionado a scripts

# 3. Teste E2E
pnpm test:e2e -- --grep "NavDrawer"
# Deve passar: drawer abre e fecha
```

## Lições Aprendidas

### 1. Console do navegador é a primeira fonte de verdade

Sempre que um componente React com `client:*` renderiza mas não interage, o **primeiro passo é abrir o console do navegador** e procurar erros de CSP, erros de rede, ou erros de hidratação. Isso teria economizado horas.

### 2. Testes E2E com captura de console são essenciais

Testes E2E devem sempre capturar `console.error` e `pageerror`:

```typescript
test('deve hidratar sem erros', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(err.message));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  await page.goto('/');
  expect(errors).toHaveLength(0);
});
```

### 3. CSP deve ser testada em todas as rotas

Adicione um teste E2E que verifica se o CSP permite a hidratação dos islands. O projeto já tem `tests/e2e/csp-server-defer.spec.ts`.

### 4. Scripts inline do Astro são requisito, não opção

O Astro SSR gera scripts inline para:
- Definir `Astro.load`, `Astro.idle`, etc.
- Disparar eventos `astro:load`, `astro:idle`
- Inicializar o sistema de ilhas

Sem `'unsafe-inline'` (ou nonce), **nenhuma hidratação acontece**.

## Arquivos alterados

- `src/middleware.ts` — adicionado `'unsafe-inline'` ao `script-src` da CSP

## Ações preventivas

- [ ] Teste E2E verifica console do navegador após carregar página
- [ ] Teste E2E verifica que island hidratou (botão + click + verifica conteúdo)
- [ ] CSP é testada manualmente com `curl -I` em todas as rotas
- [ ] Mudanças na CSP são revisadas por outro desenvolvedor
- [ ] Erros de CSP são monitorados (Reporting API com `report-uri`)
