---
title: "Postmortem 006: Erro de Hooks React no SSR (Vite + Cloudflare Workerd)"
---

## Sumário

- **Data:** 2026-05-09
- **Componentes:** `HeroCarousel`, `NavDrawer`, `SearchCommand`, `LoginDialog`
- **Sintoma:** Erro `Invalid hook call` e `TypeError: Cannot read properties of null (reading 'useState')` durante o SSR no ambiente de desenvolvimento. Ocorriam também erros de `file not found` em chunks do diretório `.cache/vite/deps_ssr`.
- **Severidade:** Alta — impedia o carregamento de qualquer página com componentes React hidratados (`client:load`).
- **Root cause:** Descoberta em cascata de dependências pelo Vite. À medida que o servidor SSR encontrava novas dependências (como `@base-ui/react/*`), ele disparava re-otimizações e recarregamentos do runtime `workerd` (Cloudflare), causando a coexistência de múltiplas instâncias do React e quebrando o singleton de hooks.

## Timeline

1. Usuário tentou iniciar o servidor de desenvolvimento (`pnpm run dev`).
2. O servidor iniciou, mas ao carregar a página inicial, o Vite começou a otimizar dependências uma a uma (`@libsql/client`, `@base-ui/react/drawer`, `lucide-react`, etc).
3. Cada otimização disparava um recarregamento do programa (`[vite] program reload`).
4. Durante um dos recarregamentos, o runtime falhou ao encontrar um chunk específico (`chunk-AGMJKLV5.js`) no cache.
5. Após o erro de arquivo não encontrado, começaram os erros de `Invalid hook call` em todos os componentes React do navbar e do hero.
6. Investigação revelou que o ambiente SSR estava carregando instâncias duplicadas ou corrompidas do React devido aos múltiplos reloads simultâneos do Vite.

## Root Cause

O Vite, por padrão, descobre e otimiza dependências conforme são encontradas no código durante o desenvolvimento. Em projetos Astro com o adaptador `@astrojs/cloudflare` e o runtime `workerd`, cada nova dependência descoberta causa um recarregamento total do ambiente de execução do worker. 

Em uma página com muitos componentes React (`HeroCarousel`, `NavDrawer`, `SearchCommand`, `LoginDialog`), esse processo se torna em cascata. O recarregamento rápido e sucessivo do `workerd` leva a:
1. **Invalidação de cache:** Chunks gerados na rodada anterior são deletados/sobrescritos enquanto o worker ainda tenta lê-los.
2. **Duplicação de Instâncias:** O React depende de um singleton interno para gerenciar hooks. Se o Vite não pré-empacota o React corretamente ou se há reloads desordenados, o worker acaba carregando mais de uma cópia do React, resultando no erro de hooks.

## Solução

1. **Limpeza de Cache:** Remoção forçada do diretório `.cache/vite` para garantir um estado limpo.
2. **Pré-otimização Total:** Configuração de `optimizeDeps.include` no `astro.config.mjs` para incluir todas as bibliotecas principais do projeto.

```javascript
// astro.config.mjs
vite: {
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      '@base-ui/react/drawer',
      '@base-ui/react/collapsible',
      'embla-carousel-react',
      // ... outras deps de UI
    ],
  },
}
```

Isso força o Vite a otimizar todas essas bibliotecas de uma vez no startup, evitando descobertas tardias no meio do SSR e garantindo que apenas uma instância do React seja compartilhada entre todos os módulos.

## Arquivos alterados

- `astro.config.mjs` — adicionado `optimizeDeps.include` com a lista exaustiva de dependências de UI.

## Lições aprendidas

1. O runtime `workerd` do Cloudflare é mais sensível a reloads parciais do Vite do que o ambiente Node.js tradicional.
2. Em projetos Astro + Cloudflare + React 19, a pré-otimização de dependências (`optimizeDeps.include`) não é opcional; é necessária para estabilidade do ambiente de desenvolvimento.
3. Se o console começar a mostrar muitas mensagens de `✨ new dependencies optimized`, é sinal de que o arquivo de configuração precisa ser atualizado para evitar um crash iminente por cascata.

## Ações preventivas

- Ao adicionar novas bibliotecas de componentes React (ex.: `framer-motion`, `radix-ui`), adicioná-las imediatamente ao `optimizeDeps.include` no `astro.config.mjs`.
- Manter o script `pnpm dev` monitorado; se houver reloads excessivos no startup, revisar a lista de dependências incluídas.
