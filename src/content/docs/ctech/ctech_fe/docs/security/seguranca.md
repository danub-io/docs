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
