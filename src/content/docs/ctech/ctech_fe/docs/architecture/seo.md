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

Implementar futuramente para páginas de review:
```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Nome do Produto",
  "review": {
    "@type": "Review",
    "reviewRating": {
      "@type": "Rating",
      "ratingValue": "9.2"
    }
  }
}
```

## Boas Práticas

- URLs limpas e descritivas (`/reviews/sony-wh-1000xm5`)
- Meta descrições únicas por página
- Atributos `alt` em todas as imagens
- URLs canônicas para evitar conteúdo duplicado
- Heading hierarchy correta (`h1` → `h2` → `h3`)
