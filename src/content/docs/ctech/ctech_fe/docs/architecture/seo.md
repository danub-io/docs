---
title: "Estratégia de SEO"
---



## Meta Tags

As meta tags são definidas no `Layout.astro` e incluem:
- `<title>` e `<meta name="description">` por página
- Open Graph (`og:title`, `og:description`, `og:image`, `og:type`)
- Twitter Cards (`twitter:card`, `twitter:title`, `twitter:description`)

## Sitemap

Gerado automaticamente via `@astrojs/sitemap` no build. URL base configurada em `astro.config.mjs`.

## Dados Estruturados (JSON-LD)

Implementado nas páginas de produto (`/produto/[slug]`) utilizando o padrão `Product` do Schema.org. Inclui nome, imagem, descrição, marca e dados da review (nota técnica da TECHREVEAL).

## Boas Práticas

- URLs limpas e descritivas (`/produto/sony-wh-1000xm5`)
- Meta descrições únicas por página
- Atributos `alt` em todas as imagens
- URLs canônicas para evitar conteúdo duplicado
- Heading hierarchy correta (`h1` → `h2` → `h3`)
