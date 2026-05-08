---
title: "Postmortem 001: Select dropdown causa encolhimento da página no mobile"
---

## Sumário

- **Data:** 2026-05-08
- **Componente:** `OrdenacaoBusca` (Select Base UI) na página de busca
- **Sintoma:** Ao clicar no dropdown de ordenação no mobile, a página diminuía de largura e aparecia uma barra branca à direita.
- **Severidade:** Média — afetava apenas mobile, apenas na interação com o Select.
- **Root cause:** `useAnchoredPopupScrollLock` do Base UI aplicava `overflow: hidden` no `<body>` via `useScrollLock` sempre que o Select abria. No mobile, isso recalculava o viewport, encolhendo o conteúdo.

## Timeline

1. Usuário reportou que ao clicar no seletor de ordenação na página de busca, o site "encolhia" e aparecia uma barra branca à direita.
2. Investigação inicial — inspeção de CSS descartou problemas de largura fixa, overflow, ou scrollbar-gutter.
3. Busca no código-fonte do Base UI revelou o hook `useAnchoredPopupScrollLock` no `SelectPositioner`, que condiciona o scroll lock a `(alignItemWithTriggerActive || modal) && open`.
4. Como `alignItemWithTrigger` default é `true`, o scroll lock era ativado em toda abertura do Select.
5. Solução: passar `alignItemWithTrigger={false}` no `SelectContent` usado pelo `OrdenacaoBusca`.

## Root Cause

O Base UI `Select` usa `@floating-ui` para posicionamento do popup. O positioner inclui o hook `useAnchoredPopupScrollLock`, que por sua vez chama `useScrollLock` do pacote `@base-ui/utils`. Esse hook:

1. Detecta se o elemento de referência (trigger) precisa de scroll lock.
2. Aplica `overflow: hidden` no `document.body` quando o popup abre.
3. Em mobile (viewport < 768px), o `overflow: hidden` causa recálculo do viewport, encolhendo o body e gerando o white space à direita.

O scroll lock é ativado quando `alignItemWithTriggerActive` é `true` (default) ou `modal` é `true`.

## Solução

Adicionar `alignItemWithTrigger={false}` ao `SelectContent` no componente `OrdenacaoBusca`:

```tsx
<SelectContent align="end" alignItemWithTrigger={false}>
```

Isso desabilita o scroll lock sem afetar o alinhamento do dropdown (`align="end"` continua funcionando). O popup passa a usar largura natural do conteúdo em vez de espelhar a largura do trigger.

## Arquivos alterados

- `src/modules/busca/components/OrdenacaoBusca.tsx` — adicionado `alignItemWithTrigger={false}`

## Lições aprendidas

1. O Base UI Select ativa scroll lock por padrão via `alignItemWithTrigger`. Isso não é óbvio pela API pública.
2. `overflow: hidden` no body em mobile causa recálculo de viewport em vários navegadores. Desabilitar scroll lock é a abordagem correta quando o popup não precisa de rolagem bloqueada.
3. Para debugar esse tipo de problema, monitorar mudanças de estilo no `<body>` e `<html>` via DevTools ao interagir com o componente é mais rápido que seguir a cadeia de imports no node_modules.

## Ações preventivas

- Ao usar `SelectContent` em novos contextos mobile, considerar se o scroll lock é necessário. Se o popup for pequeno (não full-screen), passar `alignItemWithTrigger={false}`.
- Se o scroll lock for necessário (ex.: select modal em mobile), testar em dispositivo real para verificar se o viewport não encolhe.
