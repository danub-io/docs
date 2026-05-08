---
title: "Segurança — Frontend CTECH"
---



Este documento descreve as medidas de segurança implementadas no frontend.

## Content Security Policy (CSP)

Definida no middleware (`src/middleware.ts`). Política atual simplificada (Astro requer `unsafe-inline` para estilos SSR):

```
default-src 'self';
script-src 'self' 'unsafe-inline';
style-src 'self' 'unsafe-inline';
img-src 'self' blob: data: https://*;
connect-src 'self' https://*;
frame-ancestors 'none';
```

> **Nota:** `unsafe-inline` em scripts é necessário para o Astro (injeção de scripts inline no SSR). `https://*` em imagens/conexões aceita qualquer fonte HTTPS (flexibilidade para afiliados e CDNs).

### Como modificar

Edite `src/middleware.ts` e teste:

```bash
curl -I http://localhost:4321 | grep content-security-policy
```

## HTTP Headers de Segurança

| Header | Valor | Efeito |
|--------|-------|--------|
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` | Força HTTPS por 2 anos com preload |
| `X-Frame-Options` | `DENY` | Protege contra clickjacking |
| `X-Content-Type-Options` | `nosniff` | Impede MIME sniffing |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Controla envio de referrer |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=(), interest-cohort=()` | Desabilita APIs sensíveis e FLoC |

Configurados no middleware Astro (`src/middleware.ts`).

## Proteção contra SQL Injection

O banco Turso é acessado **apenas em SSR** (nunca no cliente). Todas as consultas usam placeholders parametrizados:

```typescript
// Correto (parametrizado)
await db.execute({
  sql: 'SELECT * FROM Produtos WHERE slug = ?',
  args: [slug],
});

// Errado (nunca fazer)
await db.execute(`SELECT * FROM Produtos WHERE slug = '${slug}'`);
```

## Acesso ao Banco

- Cliente Turso (`libsql`) importado apenas em arquivos `.astro` (frontmatter) e serviços SSR
- Nenhum endpoint expõe o cliente ao navegador
- Token de autenticação do Turso é configurado via env var e marcado como secreto na Vercel

## Práticas para Desenvolvimento

1. **Nunca** expor `TURSO_AUTH_TOKEN` em logs ou mensagens de erro
2. **Nunca** importar `src/core/lib/db.ts` em componentes React (só Astro SSR)
3. **Validar entradas:** Use Zod (`safeParse`) para dados do banco e query params
4. **Sanitizar saídas:** Astro faz escape automático em templates (`{var}`)
5. **Rate limiting:** Considere adicionar em rotas de busca se houver abuso

## Checklist para PRs

- [ ] CSP atualizada se nova CDN/externa foi adicionada
- [ ] Consultas SQL usam placeholders (`?` + `args`)
- [ ] Nenhuma credencial ou token em logs ou erros
- [ ] Componente React não importa `db` diretamente

## Troubleshooting: CSP bloqueando hidratação de componentes Astro

### Histórico

Em maio de 2026, o menu hamburguer (NavDrawer) parou de responder a cliques. O
botão renderizava no SSR, mas nada acontecia ao clicar. Foram necessárias várias
horas de debugging até identificar a causa raiz.

### Sintoma

- Componentes React com `client:load` renderizam o HTML inicial (SSR) corretamente
- Nenhum evento JavaScript é acionado ao interagir com os componentes
- Nenhum erro no console do servidor ou no build
- Erro no console do navegador:
  ```
  Executing inline script violates the following Content Security Policy
  directive 'script-src 'self''. Either the 'unsafe-inline' keyword, a
  hash, or a nonce is required to enable inline execution.
  ```

### Causa Raiz

A CSP em `src/middleware.ts` usava `script-src 'self'`, que bloqueia **todos os
scripts inline**. O Astro depende de scripts inline para o sistema de hidratação
de ilhas (`<astro-island>`):

```html
<script>
  (self.Astro || (self.Astro = {})).load = async (fn) => { await (await fn())() };
  window.dispatchEvent(new Event('astro:load'));
</script>
```

Quando esse script é bloqueado:

1. `Astro.load` nunca é definido
2. O evento `astro:load` nunca é disparado
3. As ilhas `<astro-island client="load">` ficam em estado de espera permanente
4. Os componentes React nunca hidratam
5. Os manipuladores de evento nunca são anexados ao DOM

Isso afeta **todos** os componentes React com `client:load` ou `client:idle`.

### Por que foi difícil de encontrar

1. **Build e servidor sem erros:** `pnpm build` e `pnpm dev` funcionam sem
   nenhum erro ou warning relacionado a CSP.
2. **Testes unitários passam:** Testes com Vitest + jsdom não passam pelo
   middleware Astro, então a CSP nunca é aplicada.
3. **SSR funciona:** O HTML é gerado perfeitamente no servidor — a página
   parece completa.
4. **CSP silenciosa:** Erros de CSP aparecem apenas no console do navegador,
   não no terminal do servidor.
5. **Testes isolados enganam:** Testes de unidade com `userEvent.click()` passam
   porque não há CSP no ambiente de teste.

### Lição Aprendida

**Sempre verificar o console do navegador** quando um componente React com
`client:*` renderiza mas não reage a interações. Erros de CSP são o diagnóstico
mais rápido.

### Solução

Adicionar `'unsafe-inline'` à diretiva `script-src` no middleware:

```diff
- "script-src 'self'",
+ "script-src 'self' 'unsafe-inline'",
```

### Verificação

Após a correção, o console do navegador não deve mostrar erros de CSP para
scripts. Teste com:

```bash
curl -I http://localhost:4321 | grep content-security-policy
```

A resposta deve conter `'unsafe-inline'` em `script-src`.

### Alternativas mais seguras

Se necessário restringir ainda mais os scripts inline, use **nonces**:

1. Gere um nonce criptográfico no middleware
2. Armazene em `context.locals.nonce`
3. Inclua `'nonce-{nonce}'` na CSP
4. Passe o nonce para o layout Astro via `Astro.locals.nonce`

O Astro suporta nonces para scripts inline gerados por ele. Consulte a
[documentação oficial do Astro sobre
nonce](https://docs.astro.build/en/guides/content-security-policy/).
