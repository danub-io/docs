---
title: "Postmortem 005: Scroll Horizontal, Paddings e Corte Visual"
---

# Postmortem 005: Scroll Horizontal, Paddings e Corte Visual no Hero

## Sumário

- **Data:** 2026-05-08
- **Componente:** `ctech_fe/src/modules/inicio/components/HeroHorizontal.astro`
- **Sintoma:** Os cards do Hero estavam encostando nas bordas da tela (corte visual em 0px) durante a rolagem horizontal, diferindo do padrão das outras seções que tinham um respiro de 16px antes de sumirem da tela.
- **Severidade:** Baixa — Inconsistência de UI/UX
- **Root cause:** Aplicar o padding (`px-4`) *dentro* do container de scroll (`overflow-x-auto`) faz com que o container ocupe 100% da tela, cortando visualmente os cards exatamente na borda do monitor e, frequentemente, "engolindo" o padding direito.

## Timeline

1. O layout do HeroHorizontal precisou ser ajustado para trocar de carrossel mobile para cards horizontais já a partir do breakpoint `sm` (640px).
2. Durante o ajuste, o container do HeroHorizontal foi desvinculado do `layout-container` para permitir que ele centralizasse os cards sem o limite máximo de 1280px em telas ultra-wide.
3. Ao usar a largura total (`w-full`), tentamos manter o distanciamento das bordas adicionando `px-4` diretamente no container com `overflow-x-auto`, bem como `w-fit mx-auto` para tentar centralizar quando houvesse espaço.
4. Isso gerou um comportamento onde o scroll funcionava, mas os cards encostavam nos cantos da tela ao invés de sumirem a 16px de distância.
5. Tentativas com `scroll-padding`, pseudo-elementos (`after:w-4`) e espaçadores garantiam o padding *interno* do scroll, mas o corte visual ainda ocorria na borda absoluta da tela (0px).
6. A solução definitiva foi encontrada comparando o comportamento com o componente `RolagemHorizontal.astro`, que corta perfeitamente a 16px da borda por estar dentro do `layout-container`.

## Root Cause

A propriedade `overflow-x-auto` aplica um comportamento de clipping visual estrito às bordas do seu container. 
Se o container do scroll tem `w-full` (100vw), o clipping ocorrerá em 0px da tela, não importa se você colocou `px-4` dentro dele. O `px-4` interno apenas adiciona espaço ao final do *conteúdo* rolável, mas a "janela" de rolagem continua colada na borda do monitor.

## Solução

Para obter a ilusão de que os cards estão rolando e sumindo *antes* de chegar na borda da tela (um respiro de 16px), o **próprio container de scroll precisa ser menor que a tela**.
Isso foi feito movendo o padding (`px-4`) para a tag `<section>` que envolve o container flexível.

**Antes (Problema):**
```html
<section class="mb-8 mt-2 w-full">
  <div class="flex overflow-x-auto px-4 ..."> <!-- Clipping em 0px -->
    <!-- cards -->
  </div>
</section>
```

**Depois (Solução):**
```html
<section class="mb-8 mt-2 w-full px-4"> <!-- Encolhe o conteúdo interno em 32px -->
  <div class="flex overflow-x-auto ..."> <!-- Clipping em 16px -->
    <!-- cards -->
  </div>
</section>
```

Com isso, o `<div overflow-x-auto>` passa a ter a largura da tela menos 32px. O corte (clipping visual) acontece no limite da `div`, que agora está recuada 16px em relação ao monitor. E o bônus: para telas gigantes onde todos os cards cabem, basta adicionar `2xl:justify-center` no container de scroll e eles ficarão perfeitamente centralizados sem a limitação do `layout-container`.

## Lições aprendidas

1. **Clipping de Scroll:** Se quiser que os elementos desapareçam *antes* da borda da tela ao rolar, aplique margin/padding no wrapper do scroll, não dentro do scroll.
2. **Padding vs Scroll:** Paddings internos em containers de rolagem flexível (`px`) frequentemente falham no eixo direito ou causam saltos com `snap`. É melhor limitar a caixa por fora.
3. **Respeitar o padrão do site:** O `RolagemHorizontal.astro` já implementava a abordagem correta por tabela (por estar em um `layout-container`). Investigar como o comportamento foi resolvido em outro local da mesma base de código economiza um tempo valioso.

## Ações preventivas

- Ao construir layouts de "sangria" com scroll (full-bleed scroll), definir claramente se o clipping deve ocorrer na margem da janela (0px) ou alinhado à grade do site (ex: 16px).
- Usar wrappers com padding (`px-4`) em vez de `padding` interno para todos os componentes de carrossel/rolagem onde o corte visual prévio for desejado.
